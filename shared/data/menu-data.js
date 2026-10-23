/* Same content as menu-data.json, wrapped for pages opened straight from disk (file://), where fetch() is blocked.
   Edit menu-data.json, then regenerate this file (see README). */
window.IHS_MENU_DATA = {
  "_meta": {
    "source": "hamidoseafood.com/order (Astoria, NY) online pickup menu, captured 2026-10-22 ~12:10pm ET",
    "note": "Descriptions are paraphrased from the Astoria menu; the owner confirms final wording. price = null renders as [PRICE]. refPriceAstoria is an INTERNAL reference only and never appears in the UI. Option groups were read from Astoria's live item dialogs on 2026-10-22.",
    "fulfilment": "pickup only, pay online; fresh catch sold online by estimated weight (final price set by actual weight at the counter)",
    "flags": {
      "onlineByWeight": true,
      "combosLunchOnly": false
    },
    "astoriaBehaviour": "Items with no option groups are added straight to the cart from the card (no dialog). Items with options open a 'Customize' dialog. No quantity or special-instructions fields in Astoria's dialog (v2 adds both)."
  },
  "optionGroups": {
    "twoSides": {
      "label": "Combo Sides (pick 2)",
      "required": true,
      "min": 2,
      "max": 2,
      "allowRepeat": true,
      "ui": "stepper per side with a '0 / 2' counter",
      "choices": [
        "SD-03 Baba Ganoush (Small)",
        "SD-05 Beet Salad (Small)",
        "SD-07 Garlic Eggplant (Small)",
        "SD-04 Hamido Salad (Small)",
        "SD-06 Lemon Potatoes (Small)",
        "SD-08 Moussaka (Small)",
        "SD-01 Rice (Small)",
        "SD-09 Seasoned Fries (Small)",
        "SD-02 Tahini (Small)"
      ]
    },
    "prepFriedGrilled": {
      "label": "Cooking Preparation (required)",
      "required": true,
      "min": 1,
      "max": 1,
      "choices": [
        "Grilled",
        "Fried"
      ]
    },
    "riceSize": {
      "label": "Size",
      "required": true,
      "min": 1,
      "max": 1,
      "choices": [
        {
          "name": "Small",
          "price": null,
          "refPriceAstoria": 5.0
        },
        {
          "name": "Medium",
          "price": null,
          "refPriceAstoria": 6.0
        },
        {
          "name": "Large",
          "price": null,
          "refPriceAstoria": 7.0
        }
      ],
      "note": "Astoria lists Rice Small / Medium / Large as three separate items; v2 shows one Rice item with a size choice."
    },
    "sandwichSide": {
      "label": "Sandwich Side (pick 1)",
      "required": true,
      "min": 1,
      "max": 1,
      "choices": [
        "Fries (Small)",
        "Potato Chips Classic",
        "Potato Chips BBQ",
        "Potato Chips Salt & Vinegar",
        "Potato Chips Sour Cream & Onion"
      ]
    },
    "weightLb": {
      "label": "Estimated weight",
      "required": true,
      "min": 1,
      "max": 1,
      "ui": "chips + 'Other' stepper in 0.5 lb steps",
      "choices": [
        1,
        1.5,
        2,
        2.5,
        3,
        "Other"
      ],
      "minLb": 0.5,
      "maxLb": "[MAX LB]",
      "helper": "About 1 lb of whole fish per person [OWNER CONFIRM]"
    },
    "cookingStyle": {
      "label": "How should the chef cook it?",
      "required": true,
      "min": 1,
      "max": 1,
      "choices": [
        {
          "id": "K-01",
          "name": "Grilled",
          "extraPrice": 0
        },
        {
          "id": "K-02",
          "name": "Fried",
          "extraPrice": 0
        },
        {
          "id": "K-03",
          "name": "Baked",
          "extraPrice": 0
        },
        {
          "id": "K-04",
          "name": "Singari",
          "extraPrice": null
        },
        {
          "id": "K-05",
          "name": "Rada",
          "extraPrice": null
        },
        {
          "id": "K-06",
          "name": "Butterfly",
          "extraPrice": null
        },
        {
          "id": "K-07",
          "name": "Deboned",
          "extraPrice": null
        }
      ]
    },
    "addSides": {
      "label": "Add sides (optional)",
      "required": false,
      "min": 0,
      "max": 10,
      "allowRepeat": true,
      "ui": "stepper per side, each [PRICE]",
      "choices": [
        "SD-01",
        "SD-02",
        "SD-03",
        "SD-04",
        "SD-05",
        "SD-06",
        "SD-07",
        "SD-08",
        "SD-09"
      ]
    }
  },
  "categories": [
    {
      "id": "fresh",
      "name": "Fresh Catch · by the lb",
      "arabic": "سمك طازج بالرطل",
      "note": "Market price per lb + cooking charge per lb. You pay the estimated total online; we weigh your fish at the counter and the final price is set by actual weight. [VERIFY: POS supports weight-adjusted charges]",
      "stylesNote": "Per-fish cooking styles are a default assumption [OWNER CONFIRM].",
      "refAstoria": "market price + $4/lb cooking charge; singari/rada/butterfly/deboned extra (Astoria sells by the lb in-store only; online by-weight is new for Orland Park)",
      "items": [
        {
          "id": "F-01",
          "name": "Branzino",
          "description": "Mediterranean sea bass.",
          "pricing": "perLb",
          "pricePerLb": null,
          "cookingChargePerLb": null,
          "availableToday": true,
          "styles": "all",
          "options": [
            "weightLb",
            "cookingStyle",
            "addSides"
          ]
        },
        {
          "id": "F-02",
          "name": "Salmon",
          "description": "[OWNER: description]",
          "pricing": "perLb",
          "pricePerLb": null,
          "cookingChargePerLb": null,
          "availableToday": true,
          "styles": [
            "K-01",
            "K-02",
            "K-03",
            "K-04"
          ],
          "options": [
            "weightLb",
            "cookingStyle",
            "addSides"
          ]
        },
        {
          "id": "F-03",
          "name": "Red Snapper",
          "description": "[OWNER: description]",
          "pricing": "perLb",
          "pricePerLb": null,
          "cookingChargePerLb": null,
          "availableToday": true,
          "styles": "all",
          "options": [
            "weightLb",
            "cookingStyle",
            "addSides"
          ]
        },
        {
          "id": "F-04",
          "name": "Tiger Shrimp",
          "description": "[OWNER: description]",
          "pricing": "perLb",
          "pricePerLb": null,
          "cookingChargePerLb": null,
          "availableToday": true,
          "styles": [
            "K-01",
            "K-02",
            "K-04"
          ],
          "options": [
            "weightLb",
            "cookingStyle",
            "addSides"
          ]
        },
        {
          "id": "F-05",
          "name": "Scallops",
          "description": "[OWNER: description]",
          "pricing": "perLb",
          "pricePerLb": null,
          "cookingChargePerLb": null,
          "availableToday": true,
          "styles": [
            "K-01",
            "K-02",
            "K-04"
          ],
          "options": [
            "weightLb",
            "cookingStyle",
            "addSides"
          ]
        },
        {
          "id": "F-06",
          "name": "Lobster",
          "description": "[OWNER: description]",
          "pricing": "perLb",
          "pricePerLb": null,
          "cookingChargePerLb": null,
          "availableToday": true,
          "styles": [
            "K-01",
            "K-03"
          ],
          "options": [
            "weightLb",
            "cookingStyle",
            "addSides"
          ]
        }
      ]
    },
    {
      "id": "combos",
      "name": "Hamido Combos",
      "arabic": "كومبو ابن حميدو",
      "note": "Your choice of two sides (the same side can count twice). [VERIFY: lunch-only Mon–Fri 12–4 (per the Astoria homepage) or all day (per the order page)?]",
      "items": [
        {
          "id": "CB-01",
          "name": "Grilled Salmon",
          "description": "Half a pound of grilled salmon, with your choice of two sides.",
          "price": null,
          "refPriceAstoria": 21.99,
          "options": [
            "twoSides"
          ]
        },
        {
          "id": "CB-02",
          "name": "Mixed Grilled Calamari & Shrimp",
          "description": "Half a pound of calamari and shrimp off the grill, with your choice of two sides.",
          "price": null,
          "refPriceAstoria": 21.99,
          "options": [
            "twoSides"
          ]
        },
        {
          "id": "CB-03",
          "name": "Mixed Fried Calamari & Shrimp",
          "description": "Half a pound of calamari and shrimp, lightly battered and fried, with your choice of two sides.",
          "price": null,
          "refPriceAstoria": 21.99,
          "options": [
            "twoSides"
          ]
        },
        {
          "id": "CB-04",
          "name": "Tiger Shrimp, Grilled or Fried",
          "description": "Seven black tiger shrimp, grilled or fried, with your choice of two sides.",
          "price": null,
          "refPriceAstoria": 21.99,
          "options": [
            "prepFriedGrilled",
            "twoSides"
          ]
        },
        {
          "id": "CB-05",
          "name": "Calamari, Grilled or Fried",
          "description": "Half a pound of calamari, grilled or fried, with your choice of two sides.",
          "price": null,
          "refPriceAstoria": 21.99,
          "options": [
            "prepFriedGrilled",
            "twoSides"
          ]
        },
        {
          "id": "CB-06",
          "name": "Whole Branzino, Grilled or Fried",
          "description": "A one-pound whole branzino, grilled or fried, with your choice of two sides.",
          "price": null,
          "refPriceAstoria": 21.99,
          "options": [
            "prepFriedGrilled",
            "twoSides"
          ]
        }
      ]
    },
    {
      "id": "signature",
      "name": "Signature Dishes",
      "arabic": "أطباق ابن حميدو",
      "items": [
        {
          "id": "SG-01",
          "name": "Branzino Stuffed Singari",
          "description": "Whole branzino, butterflied and stuffed with calamari, shrimp and vegetables, Alexandrian singari style.",
          "price": null,
          "refPriceAstoria": 31.99,
          "options": []
        },
        {
          "id": "SG-02",
          "name": "Whole Wild Red Snapper",
          "description": "A one-pound wild red snapper, butterflied, fried or grilled, with garlic sauce.",
          "price": null,
          "refPriceAstoria": 26.99,
          "options": [
            "prepFriedGrilled"
          ]
        },
        {
          "id": "SG-03",
          "name": "Seafood Tajin",
          "description": "A one-pound stew of calamari and shrimp baked in tomato sauce.",
          "price": null,
          "refPriceAstoria": 29.99,
          "options": []
        },
        {
          "id": "SG-04",
          "name": "Head-on Shrimp Butterfly",
          "description": "About a pound of wild head-on shrimp (3–4 pieces by weight) in a savory butter sauce.",
          "price": null,
          "refPriceAstoria": 40.99,
          "options": []
        },
        {
          "id": "SG-05",
          "name": "Jumbo Shrimp Grilled",
          "description": "Wild jumbo shrimp stuffed with vegetables, grilled in garlic olive oil.",
          "price": null,
          "refPriceAstoria": 24.99,
          "options": []
        },
        {
          "id": "SG-06",
          "name": "King Crab Legs",
          "description": "One pound of king crab legs in butter sauce, with extra sauce on the side.",
          "price": null,
          "refPriceAstoria": 99.99,
          "options": []
        },
        {
          "id": "SG-07",
          "name": "Lobster Tail (9 oz)",
          "description": "A 9 oz lobster tail with a buttery finish.",
          "price": null,
          "refPriceAstoria": 29.99,
          "options": []
        },
        {
          "id": "SG-08",
          "name": "Baked Clams",
          "description": "A dozen little neck clams baked in garlic olive oil.",
          "price": null,
          "refPriceAstoria": 21.99,
          "options": []
        },
        {
          "id": "SG-09",
          "name": "Scallops & Shrimp Linguine",
          "description": "Scallops and shrimp tossed with linguine in garlic sauce.",
          "price": null,
          "refPriceAstoria": 23.99,
          "options": []
        },
        {
          "id": "SG-10",
          "name": "White Sauce Pasta with Shrimp",
          "description": "Penne and shrimp in a creamy white sauce. One serving.",
          "price": null,
          "refPriceAstoria": 16.99,
          "options": []
        },
        {
          "id": "SG-11",
          "name": "Fish & Chips",
          "description": "Four fried tilapia fillets with seasoned fries.",
          "price": null,
          "refPriceAstoria": 19.99,
          "options": [
            "sandwichSide"
          ]
        },
        {
          "id": "SG-12",
          "name": "White Fried Shrimp",
          "description": "Fifteen fried white shrimp with tartar sauce.",
          "price": null,
          "refPriceAstoria": 15.99,
          "options": []
        },
        {
          "id": "SG-13",
          "name": "Hamido Seafood Pizza",
          "description": "A 12-inch pizza with shrimp, scallops, peppers and mozzarella.",
          "price": null,
          "refPriceAstoria": 26.99,
          "options": []
        }
      ]
    },
    {
      "id": "sandwiches",
      "name": "Seafood Sandwiches",
      "arabic": "سندوتشات",
      "note": "Served with fries or potato chips (4 flavors).",
      "items": [
        {
          "id": "SW-01",
          "name": "Fried Fish Fillet Sandwich",
          "description": "Fried tilapia with sautéed peppers and onions on a hero.",
          "price": null,
          "refPriceAstoria": 12.99,
          "options": [
            "sandwichSide"
          ]
        },
        {
          "id": "SW-02",
          "name": "Grilled Fish Fillet Sandwich",
          "description": "Grilled tilapia with sautéed peppers and onions on a hero.",
          "price": null,
          "refPriceAstoria": 12.99,
          "options": [
            "sandwichSide"
          ]
        },
        {
          "id": "SW-03",
          "name": "Fried Shrimp Sandwich",
          "description": "Fried shrimp with lettuce and tartar sauce on a hero.",
          "price": null,
          "refPriceAstoria": 12.99,
          "options": [
            "sandwichSide"
          ]
        },
        {
          "id": "SW-04",
          "name": "Grilled Shrimp Sandwich",
          "description": "Grilled shrimp with peppers and onions on a hero.",
          "price": null,
          "refPriceAstoria": 12.99,
          "options": [
            "sandwichSide"
          ]
        },
        {
          "id": "SW-05",
          "name": "Salmon Burger",
          "description": "Homemade salmon patty with peppers and onions on a brioche bun.",
          "price": null,
          "refPriceAstoria": 12.99,
          "options": [
            "sandwichSide"
          ]
        }
      ]
    },
    {
      "id": "sides",
      "name": "Salads & Sides",
      "arabic": "سلطات",
      "items": [
        {
          "id": "SD-01",
          "name": "Rice",
          "description": "Egyptian golden rice cooked with caramelized onions.",
          "price": null,
          "refPriceAstoria": "5.00 / 6.00 / 7.00",
          "options": [
            "riceSize"
          ]
        },
        {
          "id": "SD-02",
          "name": "Tahini",
          "description": "Smooth sesame tahini.",
          "price": null,
          "refPriceAstoria": 6.0,
          "options": []
        },
        {
          "id": "SD-03",
          "name": "Babaghanoush",
          "description": "Smoked eggplant with tahini, lemon, garlic and olive oil.",
          "price": null,
          "refPriceAstoria": 6.0,
          "options": []
        },
        {
          "id": "SD-04",
          "name": "Hamido (House) Salad",
          "description": "Tomato, cucumber, cilantro and onion with vinegar and olive oil.",
          "price": null,
          "refPriceAstoria": 7.49,
          "options": []
        },
        {
          "id": "SD-05",
          "name": "Beet Salad",
          "description": "Diced beets with garlic and olive oil.",
          "price": null,
          "refPriceAstoria": 6.0,
          "options": []
        },
        {
          "id": "SD-06",
          "name": "Lemon Potatoes",
          "description": "Roasted potatoes and bell peppers in lemon and olive oil.",
          "price": null,
          "refPriceAstoria": 6.0,
          "options": []
        },
        {
          "id": "SD-07",
          "name": "Garlic Eggplant",
          "description": "Roasted eggplant and mild chilies in a garlic-vinegar marinade.",
          "price": null,
          "refPriceAstoria": 6.0,
          "options": []
        },
        {
          "id": "SD-08",
          "name": "Moussaka",
          "description": "Roasted eggplant and chilies in a garlicky tomato sauce. Vegetarian.",
          "price": null,
          "refPriceAstoria": 6.0,
          "options": []
        },
        {
          "id": "SD-09",
          "name": "French Fries",
          "description": "Straight-cut fries with house seasoning.",
          "price": null,
          "refPriceAstoria": 7.49,
          "options": []
        },
        {
          "id": "SD-10",
          "name": "Greek Salad",
          "description": "Romaine, cucumber, tomato, onion, olives and feta with vinaigrette.",
          "price": null,
          "refPriceAstoria": 10.49,
          "options": []
        },
        {
          "id": "SD-11",
          "name": "Herring Salad",
          "description": "Smoked herring with tahini, tomato, lemon and vinegar.",
          "price": null,
          "refPriceAstoria": 9.0,
          "options": []
        },
        {
          "id": "SD-12",
          "name": "Mezza Platter",
          "description": "Tahini, babaghanoush, moussaka and lemon potatoes on one platter.",
          "price": null,
          "refPriceAstoria": 16.0,
          "options": []
        }
      ]
    }
  ]
};
