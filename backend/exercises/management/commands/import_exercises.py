"""python manage.py import_exercises
从开源 yuhonas/free-exercise-db 导入动作与图片。以 name 为键 update_or_create，可重复执行。"""
import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from exercises import importing
from exercises.models import Exercise

USER_AGENT = 'GYM-WIKI-importer/1.0'
IMAGE_SUBDIR = Path('exercises') / 'free_exercise_db'


class Command(BaseCommand):
    help = 'Import public-domain exercises and images from yuhonas/free-exercise-db.'

    def add_arguments(self, parser):
        parser.add_argument('--limit-per-group', type=int, default=6,
                            help='Number of exercises to pick for each fine muscle group.')
        parser.add_argument('--skip-images', action='store_true',
                            help='Import text only; keep existing image fields unchanged.')
        parser.add_argument('--prune', action='store_true',
                            help='Delete previously imported exercises that are no longer selected.')
        parser.add_argument('--data-url', default=importing.DATA_URL,
                            help='URL of the combined free-exercise-db JSON.')
        parser.add_argument('--data-file', default=None,
                            help='Read source JSON from a local file instead of --data-url '
                                 '(imports every usable entry, no per-group selection).')

    def handle(self, *args, **options):
        limit = options['limit_per_group']
        if limit < 1:
            raise CommandError('--limit-per-group must be at least 1.')

        if options['data_file']:
            source = self.read_file(options['data_file'])
            selected = importing.select_all(source)
        else:
            source = self.fetch_json(options['data_url'])
            selected = importing.select_exercises(source, limit)
        if not selected:
            raise CommandError('No matching exercises were found in the source data.')

        image_dir = Path(settings.MEDIA_ROOT) / IMAGE_SUBDIR
        if not options['skip_images']:
            image_dir.mkdir(parents=True, exist_ok=True)

        created_count = updated_count = image_count = 0
        with transaction.atomic():
            for exercise, category in selected:
                fields = importing.build_fields(exercise, category)
                if exercise.get('images'):
                    if options['skip_images']:
                        # 不下载；但本机已有这张图时照样关联上
                        image_name = self.existing_image(exercise, image_dir)
                    else:
                        image_name = self.download_first_image(exercise, image_dir)
                        image_count += bool(image_name)
                    if image_name:
                        fields['standard_image'] = image_name
                # reviewed（人工抽检）与 video 不在 defaults 里，重复导入不覆盖
                _, created = Exercise.objects.update_or_create(name=exercise['name'].strip(), defaults=fields)
                if created:
                    created_count += 1
                else:
                    updated_count += 1

            pruned_count = 0
            if options['prune']:
                # 只删本命令导入过、这次没选中的动作；手工录入的不动
                keep = [exercise['name'].strip() for exercise, _ in selected]
                stale = Exercise.objects.filter(source_name=importing.SOURCE_NAME).exclude(name__in=keep)
                pruned_count = stale.count()
                stale.delete()

        if pruned_count:
            self.stdout.write(f'Pruned {pruned_count} exercises no longer selected.')
        self.stdout.write(self.style.SUCCESS(
            f'Imported {created_count + updated_count} exercises: {created_count} created, '
            f'{updated_count} updated, {image_count} images saved.'
        ))

    def read_file(self, path):
        try:
            return json.loads(Path(path).read_text(encoding='utf-8'))
        except (OSError, json.JSONDecodeError) as exc:
            raise CommandError(f'Could not read exercise data: {exc}') from exc

    def fetch_json(self, url):
        try:
            with urlopen(Request(url, headers={'User-Agent': USER_AGENT}), timeout=60) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise CommandError(f'Could not download exercise data: {exc}') from exc

    def image_filename(self, exercise):
        image_path = exercise['images'][0]
        return f"{importing.slugify(exercise['name'])}{Path(image_path).suffix or '.jpg'}"

    def existing_image(self, exercise, image_dir):
        filename = self.image_filename(exercise)
        return (IMAGE_SUBDIR / filename).as_posix() if (image_dir / filename).exists() else ''

    def download_first_image(self, exercise, image_dir):
        """下载第一张图；已存在则复用，失败只跳过并打印。返回相对 MEDIA_ROOT 的路径或空串。"""
        image_path = exercise['images'][0]
        filename = self.image_filename(exercise)
        local_path = image_dir / filename
        if not local_path.exists():
            url = importing.IMAGE_BASE_URL + quote(image_path.replace('\\', '/'))
            try:
                with urlopen(Request(url, headers={'User-Agent': USER_AGENT}), timeout=45) as resp:
                    local_path.write_bytes(resp.read())
            except (HTTPError, URLError, TimeoutError, OSError) as exc:
                self.stderr.write(f"Image skipped for {exercise['name']}: {exc}")
                return ''
        return (IMAGE_SUBDIR / filename).as_posix()
