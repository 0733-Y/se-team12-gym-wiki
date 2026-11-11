"""T2：易错本状态机全流程（ARCHITECTURE.md 4.3）。"""
from django.test import TestCase

from common.tests.helpers import make_exercise
from feedback.models import WrongRecord


class WrongBookFlowTests(TestCase):
    def setUp(self):
        self.ex = make_exercise()
        self.base = f'/api/wrong-book/{self.ex.id}/'

    def report(self, category='form', note='elbows flare'):
        return self.client.post(self.base + 'report/', {'error_category': category, 'user_note': note},
                                content_type='application/json')

    def review(self, outcome):
        return self.client.post(self.base + 'review/', {'outcome': outcome}, content_type='application/json')

    def patch(self, body):
        return self.client.patch(self.base, body, content_type='application/json')

    def record(self):
        return WrongRecord.objects.get(exercise=self.ex)

    def test_full_flow(self):
        # report：新建
        resp = self.report()
        self.assertEqual(resp.status_code, 201)
        data = resp.json()['data']
        self.assertEqual(data['error_category'], 'form')
        self.assertEqual(data['error_count'], 1)
        self.assertEqual(data['mastery_status'], 'unfixed')
        self.assertEqual(data['exercise']['id'], self.ex.id)

        # edit：改原因与笔记，状态改为 practicing → streak 归零
        resp = self.patch({'error_category': 'path', 'user_note': 'bar path drifts', 'mastery_status': 'practicing'})
        self.assertEqual(resp.status_code, 200)
        r = self.record()
        self.assertEqual((r.error_category, r.user_note, r.mastery_status, r.success_streak),
                         ('path', 'bar path drifts', 'practicing', 0))

        # review(fixed) ×3：前两次 practicing，第三次 mastered
        for i, expected in enumerate(['practicing', 'practicing', 'mastered'], start=1):
            resp = self.review('fixed')
            self.assertEqual(resp.status_code, 200)
            d = resp.json()['data']
            self.assertEqual(d['success_streak'], i)
            self.assertEqual(d['review_count'], i)
            self.assertEqual(d['mastery_status'], expected)
        self.assertIsNotNone(self.record().last_reviewed_at)

        # review(recurred)
        d = self.review('recurred').json()['data']
        self.assertEqual((d['review_count'], d['error_count'], d['success_streak'], d['mastery_status']),
                         (4, 2, 0, 'unfixed'))

    def test_repeat_report_keeps_single_record(self):
        self.assertEqual(self.report().status_code, 201)
        self.review('fixed')
        resp = self.report('weight', 'too heavy')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(WrongRecord.objects.filter(exercise=self.ex).count(), 1)
        r = self.record()
        self.assertEqual((r.error_count, r.success_streak, r.mastery_status, r.error_category, r.user_note),
                         (2, 0, 'unfixed', 'weight', 'too heavy'))

    def test_edit_to_mastered_sets_streak_at_least_three(self):
        self.report()
        self.patch({'mastery_status': 'mastered'})
        self.assertEqual(self.record().success_streak, 3)

    def test_edit_cannot_touch_counters(self):
        self.report()
        self.patch({'error_count': 99, 'review_count': 99, 'success_streak': 99})
        r = self.record()
        self.assertEqual((r.error_count, r.review_count, r.success_streak), (1, 0, 0))

    def test_list_and_remove(self):
        self.report()
        resp = self.client.get('/api/wrong-book/')
        self.assertEqual(resp.status_code, 200)
        items = resp.json()['data']
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['exercise']['name'], self.ex.name)

        self.assertEqual(self.client.delete(self.base).status_code, 204)
        self.assertEqual(WrongRecord.objects.count(), 0)
        self.assertEqual(self.client.delete(self.base).status_code, 404)

    def test_review_without_record_is_404(self):
        resp = self.review('fixed')
        self.assertEqual(resp.status_code, 404)
        self.assertEqual(resp.json()['error']['code'], 'not_found')

    def test_invalid_bodies_are_400(self):
        self.assertEqual(self.report(category='nope').status_code, 400)
        self.report()
        self.assertEqual(self.review('maybe').status_code, 400)
        self.assertEqual(self.patch({'mastery_status': 'done'}).status_code, 400)
