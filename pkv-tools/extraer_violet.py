"""Extrae Pokemon Violet base + update con hactool de SciresM. Python 3.10+."""
from pathlib import Path
import argparse
import os
import tempfile
import datetime
import re
import shutil
import struct
import subprocess
import sys
import uuid

ROOT = Path(__file__).resolve().parent

def one(folder):
    files = list(folder.glob('*.nsp'))
    if len(files) != 1:
        raise ValueError(f'Se necesita exactamente un NSP en {folder}; encontrados: {len(files)}')
    return files[0]

def validate_keys(keydir):
    errors = []
    for filename in ('prod.keys', 'title.keys'):
        for number, line in enumerate((keydir/filename).read_text(encoding='utf-8-sig').splitlines(), 1):
            line = line.strip()
            if not line or line.startswith(('#', ';')):
                continue
            parts = re.split('[=,]', line, maxsplit=1)
            if len(parts) != 2:
                errors.append(f'{filename}, linea {number}: falta separador =')
                continue
            name, value = map(str.strip, parts)
            expected = None
            if filename == 'title.keys':
                expected = 32
                if not re.fullmatch(r'[0-9a-fA-F]{32}', name):
                    errors.append(f'{filename}, linea {number}: identificador invalido')
            elif re.fullmatch(r'(?:mariko_)?master_kek_source_[0-9a-fA-F]{2}', name):
                expected = 32
            if expected and (len(value) != expected or not re.fullmatch(r'[0-9a-fA-F]+', value)):
                errors.append(f'{filename}, linea {number}: se requieren {expected} caracteres hexadecimales; encontrados {len(value)}')
    if errors:
        raise ValueError('Formato de claves incorrecto (valores ocultos):\n' + '\n'.join(errors)
                         + '\nVuelve a exportar las claves correctas. No recortes ni rellenes los valores.')


def unpack_ncas(source, target):
    # Solo copia entradas con nombres NCA hexadecimales; nunca interpreta rutas del NSP.
    with source.open('rb') as src:
        size = source.stat().st_size
        header = src.read(16)
        if len(header) != 16:
            raise ValueError('NSP truncado')
        magic, count, names_size, _ = struct.unpack('<4sIII', header)
        start = 16 + count * 24 + names_size
        if magic != b'PFS0' or count > 100000 or names_size > 32*1024*1024 or start > size:
            raise ValueError('Cabecera PFS0 no valida')
        table = src.read(count * 24)
        names = src.read(names_size)
        selected = []
        seen = set()
        for i in range(count):
            offset, length, index, _ = struct.unpack_from('<QQII', table, i*24)
            end = names.find(b'\0', index) if index < len(names) else -1
            if end < 0 or offset + length > size - start:
                raise ValueError('Entrada PFS0 no valida')
            name = names[index:end].decode('utf-8')
            if re.fullmatch(r'[0-9a-fA-F]{32}(?:\.cnmt)?\.nca', name):
                if name.lower() in seen:
                    raise ValueError('NCA duplicado')
                seen.add(name.lower())
                selected.append((name, offset, length))
        if not selected:
            raise ValueError('No hay NCA reconocibles')
        target.mkdir(exist_ok=True)
        for name, offset, length in selected:
            existing = target/name
            if existing.exists():
                if not existing.is_file() or existing.stat().st_size != length:
                    raise ValueError(f'NCA previo incompleto: {existing}. Usa una extraccion nueva.')
                print(f'Verificando NCA existente: {name}...', flush=True)
                src.seek(start + offset)
                with existing.open('rb') as cached:
                    remaining = length
                    while remaining:
                        amount = min(4*1024*1024, remaining)
                        chunk = src.read(amount)
                        if len(chunk) != amount or cached.read(amount) != chunk:
                            raise ValueError(f'NCA previo distinto al NSP: {existing}')
                        remaining -= amount
                continue
            print(f'Copiando {source.parent.name}/{name} ({length // 1048576} MiB)...', flush=True)
            src.seek(start + offset)
            with (target / name).open('xb') as dst:
                remaining = length
                while remaining:
                    chunk = src.read(min(4*1024*1024, remaining))
                    if not chunk:
                        raise ValueError('Lectura NSP incompleta')
                    dst.write(chunk)
                    remaining -= len(chunk)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--resume', type=Path, help='Reutiliza NCA de una extraccion previa, verificando su contenido')
    parser.add_argument('--check', action='store_true', help='Comprueba requisitos sin extraer')
    parser.add_argument('--hactool', type=Path, default=ROOT/'tools'/'hactool.exe')
    args = parser.parse_args()
    base = one(ROOT/'rom'/'base')
    update = one(ROOT/'rom'/'update')
    exe = args.hactool.resolve()
    keydir = ROOT/'keys'
    missing = []
    if not exe.is_file():
        missing.append(f'hactool.exe de https://github.com/SciresM/hactool/releases -> {exe}')
    for name in ('prod.keys', 'title.keys'):
        if not (keydir/name).is_file():
            missing.append(f'Tu archivo {name} -> {keydir/name}')
    if missing:
        print('Faltan requisitos:\n' + '\n'.join('- '+x for x in missing))
        print('Las claves se mantienen locales. No se descargan ni se muestran.')
        return 2
    validate_keys(keydir)
    needed = (2 if args.resume else 3) * (base.stat().st_size + update.stat().st_size)
    if shutil.disk_usage(ROOT).free < needed:
        raise ValueError(f'Reserva al menos {needed / 1024**3:.1f} GiB libres para NCA y salida')
    print('Requisitos encontrados. Esto aun no comprueba la validez de las claves.')
    if args.check:
        return 0
    stamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S') + '_' + uuid.uuid4().hex[:6]
    job = ROOT/'extracciones'/stamp
    job.mkdir(parents=True)
    (job/'INCOMPLETO.txt').write_text('Extraccion pendiente o interrumpida. No usar como dump completo.\n', encoding='utf-8')
    prefix = [str(exe), '-k', str(keydir/'prod.keys'), '--suppresskeys', '--disablekeywarns', '-t', 'nca']
    def run(options, logname):
        # hactool no admite una ruta explicita a title.keys. Su busqueda XDG
        # usa switch/title.keys: se adapta temporalmente desde nuestras keys.
        # El entorno del usuario y su carpeta .switch no se modifican.
        with tempfile.TemporaryDirectory(prefix='violet_keys_') as config:
            switch_keys = Path(config)/'switch'
            switch_keys.mkdir()
            shutil.copyfile(keydir/'title.keys', switch_keys/'title.keys')
            child_env = os.environ.copy()
            child_env.pop('HOME', None)
            child_env.pop('USERPROFILE', None)
            child_env['XDG_CONFIG_HOME'] = config
            with (job/logname).open('w', encoding='utf-8') as log:
                result = subprocess.run(prefix + options, cwd=keydir, env=child_env,
                                        stdout=log, stderr=subprocess.STDOUT)
        output = (job/logname).read_text(encoding='utf-8', errors='replace')
        if result.returncode or re.search(r'(?i)\b(failed|unable|error)\b|\(FAIL\)', output):
            raise ValueError(f'hactool no completo la operacion. Revisa {job/logname}')
        return output
    def program(folder, allowed):
        candidates = []
        for nca in folder.glob('*.nca'):
            info = run(['-i', str(nca)], f'{folder.name}_{nca.stem}.log')
            if re.search(r'Content Type:\s*Program\b', info, re.I):
                tid = re.search(r'Title ID:\s*([0-9a-fA-F]{16})', info)
                if not tid or tid.group(1).lower() not in allowed:
                    raise ValueError('NCA Program de otro titulo; no se aplicara el parche')
                candidates.append(nca)
        if len(candidates) != 1:
            raise ValueError(f'Se esperaba un NCA Program en {folder}; encontrados: {len(candidates)}')
        return candidates[0]
    nca_job = args.resume.resolve() if args.resume else job
    if args.resume:
        if not nca_job.is_relative_to((ROOT/'extracciones').resolve()) or not nca_job.is_dir():
            raise ValueError('--resume debe indicar una carpeta existente dentro de extracciones')
    unpack_ncas(base, nca_job/'nca_base')
    unpack_ncas(update, nca_job/'nca_update')
    b = program(nca_job/'nca_base', {'01008f6008c5e000'})
    u = program(nca_job/'nca_update', {'01008f6008c5e000', '01008f6008c5e800'})
    game = job/'juego'
    game.mkdir()
    print('Extrayendo ExeFS y reconstruyendo RomFS actualizado. Puede tardar varios minutos.', flush=True)
    run(['-x', '--basenca='+str(b), '--exefsdir='+str(game/'exefs'), '--romfsdir='+str(game/'romfs'), str(u)], 'extraccion.log')
    mainfile = game/'exefs'/'main'
    if not mainfile.is_file():
        raise ValueError('Falta exefs/main')
    with mainfile.open('rb') as f:
        if f.read(4) != b'NSO0':
            raise ValueError('exefs/main no tiene firma NSO0')
    if not (game/'exefs'/'main.npdm').is_file():
        raise ValueError('Falta exefs/main.npdm')
    if not any(p.is_file() for p in (game/'romfs').rglob('*')):
        raise ValueError('RomFS vacio')
    (job/'INCOMPLETO.txt').unlink()
    (job/'RESULTADO.txt').write_text('Extraccion terminada; estructura minima comprobada. No certifica integridad completa ni compatibilidad con un port.\nBase: '+str(base)+'\nUpdate: '+str(update)+'\n', encoding='utf-8')
    print(f'Extraccion terminada: {game}\nLos NCA intermedios se conservan en {nca_job}')
    return 0

if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError, subprocess.SubprocessError) as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print('Interrumpido. Se conserva la salida parcial marcada INCOMPLETO.', file=sys.stderr)
        sys.exit(130)
