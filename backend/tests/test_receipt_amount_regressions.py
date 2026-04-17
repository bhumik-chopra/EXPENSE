import importlib.util
import pathlib
import sys
import textwrap
import unittest


BACKEND_DIR = pathlib.Path(__file__).resolve().parents[1]
APP_PATH = BACKEND_DIR / "app.py"


def load_receipt_processor():
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))

    spec = importlib.util.spec_from_file_location("expense_backend_app", APP_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module, module.ReceiptProcessor()


class ReceiptAmountRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app_module, cls.processor = load_receipt_processor()

    @classmethod
    def tearDownClass(cls):
        expense_store = getattr(cls.app_module, "expense_store", None)
        client = getattr(expense_store, "client", None)
        if client is not None:
            client.close()

    def assert_amount(self, text: str, expected_amount: float):
        payload = self.processor._build_text_payload(textwrap.dedent(text).strip(), source="test")
        self.assertFalse(payload["manual_entry_required"], payload)
        self.assertAlmostEqual(payload["amount"], expected_amount, places=2)

    def test_pls_fay_receipt_keeps_labeled_total(self):
        self.assert_amount(
            """
            TAX INVOICE
            AGGARWAL STORE
            PLOT NO.4 RAJAN VIHAR HASTSAL
            NEW DELHI 110059
            PHONE NO. 9211798898
            Name: CASH
            Bill No:A005008
            DATE & TIME:08/04/2026 20:47
            S. QTY. DESCRIPTION MRP RATE AMT.
            1 1.00 NOUVETTA ELECTRI 4190 1396.7 1396.7
            2 2.00 ICE BOLL 0.00 30.00 60.00
            TOTAL ITEM QTY. 3.000
            Total Sale Inclusive of GST.
            PLS FAY 1457.00
            Rs. One Thousand Four Hundred and Fifty Seven only
            """,
            1457.0,
        )

    def test_existing_pls_pay_total_still_works(self):
        self.assert_amount(
            """
            STORE
            PLS PAY 245.50
            """,
            245.5,
        )

    def test_existing_please_pay_total_still_works(self):
        self.assert_amount(
            """
            STORE
            PLEASE PAY 780.00
            """,
            780.0,
        )

    def test_existing_grand_total_still_works(self):
        self.assert_amount(
            """
            CAFE
            SUBTOTAL 420.00
            CGST 37.80
            SGST 37.80
            GRAND TOTAL 495.60
            """,
            495.6,
        )

    def test_amount_in_words_only_still_works(self):
        self.assert_amount(
            """
            MEDICAL STORE
            Rs. One Thousand Two Hundred Thirty Four only
            """,
            1234.0,
        )

    def test_header_number_does_not_override_invoice_total(self):
        self.assert_amount(
            """
            STORE
            NEW DELHI 110059
            INVOICE TOTAL 999.00
            """,
            999.0,
        )

    def test_item_rows_still_sum_when_no_total_label_exists(self):
        self.assert_amount(
            """
            ITEM QTY PRICE AMOUNT
            APPLE 2 30.00 60.00
            BREAD 1 40.00 40.00
            """,
            100.0,
        )


if __name__ == "__main__":
    unittest.main()
