from __future__ import annotations

import json
import unittest
from pathlib import Path

from scripts.catalog_loader import load_catalog

ROOT = Path(__file__).resolve().parents[1]


class StaticProjectTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = load_catalog()
        cls.products = cls.payload["products"]

    def test_catalog_has_unique_ids_and_slugs(self):
        ids = [item["id"] for item in self.products]
        slugs = [item["slug"] for item in self.products]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(len(slugs), len(set(slugs)))

    def test_prices_file_is_applied(self):
        price_book = json.loads((ROOT / "data" / "precos.json").read_text(encoding="utf-8"))
        by_slug = {p["slug"]: p for p in self.products}
        for slug, expected in price_book.items():
            self.assertIn(slug, by_slug)
            actual = {str(o.get("label") or "Opção"): float(o["price"]) for o in by_slug[slug]["options"]}
            self.assertEqual(actual, {str(label): float(price) for label, price in expected.items()})
            self.assertTrue(all(price > 0 for price in actual.values()))

    def test_simple_price_file_exists(self):
        self.assertTrue((ROOT / "data" / "precos.json").is_file())

    def test_requested_esfirra_flavors(self):
        combo = next(p for p in self.products if p["slug"] == "combos-esfirras-abertas")
        self.assertEqual(combo["flavors"], [
            "Queijo e Presunto",
            "Queijo e Manjericão",
            "Carne Temperada com Cheddar",
        ])

    def test_product_images_exist(self):
        for item in self.products:
            self.assertTrue((ROOT / item["image"]).is_file(), item["image"])

    def test_coca_cola_source_and_optimized_image_exist(self):
        self.assertTrue((ROOT / "assets/source/coca-cola-original.png").is_file())
        self.assertTrue((ROOT / "assets/images/coca-cola-1-5l.webp").is_file())

    def test_core_files_exist(self):
        for rel in [
            "index.html", "offline.html", "assets/css/style.css", "assets/js/app.js",
            "assets/js/catalog-data.js", "app.py", "scripts/build_product_pages.py",
            ".github/workflows/pages.yml", "assets/css/vfx.css", "assets/js/vfx.js"
        ]:
            self.assertTrue((ROOT / rel).is_file(), rel)

    def test_ultra_visual_layer_and_tajo_credit(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("TAJO Digital 3F", html)
        self.assertIn("assets/css/vfx.css", html)
        self.assertIn("assets/js/vfx.js", html)
        footer = html.split('<footer class="site-footer">', 1)[1].split('</footer>', 1)[0]
        self.assertNotIn("TAJO Digital 3F", footer)

    def test_generated_esfirra_closeups_exist(self):
        for name in [
            "esfirra-queijo-presunto.webp",
            "esfirra-queijo-manjericao.webp",
            "esfirra-carne-cheddar.webp",
        ]:
            path = ROOT / "assets" / "images" / name
            self.assertTrue(path.is_file(), str(path))
            self.assertGreater(path.stat().st_size, 50_000)



    def test_maracuja_products_are_amanteigados_not_casadinhos(self):
        products = {p["id"]: p for p in self.products}
        puro = products[6]
        chocolate = products[7]
        self.assertEqual(puro["name"], "Amanteigado de Maracujá Puro")
        self.assertEqual(puro["slug"], "amanteigado-maracuja-puro")
        self.assertEqual(puro["category"], "Amanteigados")
        self.assertEqual(chocolate["name"], "Amanteigado de Maracujá com Chocolate")
        self.assertEqual(chocolate["slug"], "amanteigado-maracuja-chocolate")
        self.assertEqual(chocolate["category"], "Amanteigados")
        self.assertEqual(chocolate["image"], "assets/images/maracuja-chocolate.webp")
        self.assertTrue((ROOT / chocolate["image"]).is_file())

    def test_real_availability_rules(self):
        by_slug = {p["slug"]: p for p in self.products}
        self.assertEqual(by_slug["pao-caseiro-doce"]["availability"], "Finais de semana ou por encomenda")
        self.assertEqual(by_slug["pao-caseiro-sal-cebola"]["availability"], "Finais de semana ou por encomenda")
        self.assertEqual(by_slug["combos-esfirras-abertas"]["availability"], "Quinta, sexta e sábado · 18h30 às 22h")
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("quinta a sábado, 18h30–22h", html)
        self.assertIn("finais de semana ou por encomenda", html)


if __name__ == "__main__":
    unittest.main()
