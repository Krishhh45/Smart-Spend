import unittest
import json
import datetime
from app import app
from services.expense_planner_ai import (
    analyze_expense_item,
    optimize_expense_plan
)

class TestExpensePlannerAI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_must_do_classification(self):
        # House rent with upcoming deadline should be classified as Must Do
        item = {
            'name': 'House Rent',
            'amount': 15000,
            'category': 'Housing',
            'deadline': (datetime.date.today() + datetime.timedelta(days=3)).isoformat(),
            'notes': 'Mandatory payment'
        }
        res = analyze_expense_item(item, available_budget=50000, past_expenses=[])
        self.assertEqual(res['priority_tier'], 'Must Do')
        self.assertEqual(res['action_type'], 'pay_now')
        self.assertEqual(res['recommended_amount'], 15000)
        self.assertEqual(res['potential_savings'], 0.0)

    def test_reduce_classification_discretionary(self):
        # Dining out with past average should be classified as Reduce with savings
        item = {
            'name': 'Weekend Fine Dining',
            'amount': 8000,
            'category': 'Food & Dining',
            'notes': 'Restaurants with friends'
        }
        past_expenses = [{'category': 'Food & Dining', 'amount': 3500}]
        res = analyze_expense_item(item, available_budget=50000, past_expenses=past_expenses)
        self.assertEqual(res['priority_tier'], 'Reduce')
        self.assertEqual(res['action_type'], 'reduce')
        self.assertLess(res['recommended_amount'], 8000)
        self.assertGreater(res['potential_savings'], 0)

    def test_can_delay_classification(self):
        # Electronics upgrade / gadget that can wait
        item = {
            'name': 'New Tablet for Gaming',
            'amount': 22000,
            'category': 'Electronics Upgrade',
            'notes': 'Can wait for Diwali sale'
        }
        res = analyze_expense_item(item, available_budget=50000, past_expenses=[])
        self.assertEqual(res['priority_tier'], 'Can Delay')
        self.assertEqual(res['action_type'], 'postpone')
        self.assertIsNotNone(res['target_deferral_month'])

    def test_avoid_classification_when_budget_strained(self):
        # Heavy luxury item that takes large share of a small budget
        item = {
            'name': 'Luxury Watch Collection',
            'amount': 12000,
            'category': 'Luxury',
            'notes': 'Impulsive purchase'
        }
        res = analyze_expense_item(item, available_budget=15000, past_expenses=[])
        self.assertEqual(res['priority_tier'], 'Avoid')
        self.assertEqual(res['action_type'], 'avoid')
        self.assertEqual(res['recommended_amount'], 0)

    def test_emergency_buffer_and_optimization(self):
        planned = [
            {'name': 'Rent', 'amount': 15000, 'category': 'Housing', 'deadline': '2026-09-12'},
            {'name': 'Electricity Bill', 'amount': 2000, 'category': 'Bills & Utilities', 'deadline': '2026-09-10'},
            {'name': 'Dining Out', 'amount': 6000, 'category': 'Food & Dining'},
            {'name': 'Trip to Beach', 'amount': 15000, 'category': 'Travel', 'notes': 'can wait'}
        ]
        plan = optimize_expense_plan(available_budget=40000, planned_expenses=planned)

        self.assertEqual(plan['available_budget'], 40000)
        self.assertEqual(plan['total_planned_expenses'], 38000)
        self.assertGreater(plan['recommended_emergency_buffer'], 0)
        self.assertLess(plan['optimized_spending_plan'], plan['total_planned_expenses'])
        self.assertGreater(plan['total_potential_savings'], 0)
        self.assertIn('what_to_pay_now', plan['action_plan'])
        self.assertIn('what_to_reduce', plan['action_plan'])
        self.assertIn('what_to_postpone', plan['action_plan'])

    def test_multilingual_rationales(self):
        item = {
            'name': 'Electricity Bill',
            'amount': 2500,
            'category': 'Bills & Utilities',
            'deadline': (datetime.date.today() + datetime.timedelta(days=2)).isoformat()
        }
        # English
        en_res = analyze_expense_item(item, available_budget=30000, past_expenses=[], language='en')
        self.assertIn('Essential baseline', en_res['reason'])

        # Hindi
        hi_res = analyze_expense_item(item, available_budget=30000, past_expenses=[], language='hi')
        self.assertIn('अनिवार्य आवश्यकता', hi_res['reason'])

        # Marathi
        mr_res = analyze_expense_item(item, available_budget=30000, past_expenses=[], language='mr')
        self.assertIn('अत्यावश्यक खर्च', mr_res['reason'])

    def test_api_endpoint_expense_planner(self):
        payload = {
            'available_budget': 45000,
            'planned_expenses': [
                {'name': 'Rent', 'amount': 18000, 'category': 'Housing'},
                {'name': 'Groceries', 'amount': 5000, 'category': 'Groceries'},
                {'name': 'Shopping', 'amount': 7000, 'category': 'Shopping'}
            ],
            'language': 'en'
        }
        response = self.app.post(
            '/api/v1/ai/expense-planner',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('optimized_spending_plan', data['data'])
        self.assertIn('action_plan', data['data'])
        self.assertIn('recommended_emergency_buffer', data['data'])

if __name__ == '__main__':
    unittest.main()
