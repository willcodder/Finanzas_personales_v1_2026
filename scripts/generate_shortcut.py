#!/usr/bin/env python3
"""
Generates the FinanzApp iOS Shortcut file (.shortcut = binary plist).
Run: python3 scripts/generate_shortcut.py
Output: public/finanzapp.shortcut
"""
import plistlib
import uuid
import os

SUPABASE_RPC = "https://hicijarieecjfhkaefsw.supabase.co/rest/v1/rpc/quick_add_transaction"
ANON_KEY = "sb_publishable_-2miYdpSur7pXIIE5ESe8Q_Q1JQYhcI"

def uid():
    return str(uuid.uuid4()).upper()

# ── Text token helpers ──────────────────────────────────────────────────────

def static_text(s: str) -> dict:
    """Plain string as a WFTextTokenString."""
    return {
        "Value": {"string": s},
        "WFSerializationType": "WFTextTokenString",
    }

def named_var(name: str) -> dict:
    """Reference to a named variable (set via setvariable action)."""
    return {
        "Value": {
            "attachmentsByRange": {
                "{0, 1}": {
                    "Type": "Variable",
                    "VariableName": name,
                }
            },
            "string": "\uFFFC",
        },
        "WFSerializationType": "WFTextTokenString",
    }

def dict_field(key: str, value: dict) -> dict:
    return {
        "WFItemType": 0,
        "WFKey": static_text(key),
        "WFValue": value,
    }

# ── Action builders ─────────────────────────────────────────────────────────

def ask_number(prompt: str, output_name: str) -> tuple[dict, str]:
    u = uid()
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.ask",
        "WFWorkflowActionParameters": {
            "WFAskActionPrompt": prompt,
            "WFInputType": "Number",
            "WFAskActionDefaultAnswer": "",
            "UUID": u,
            "CustomOutputName": output_name,
        }
    }, u

def ask_text(prompt: str, output_name: str) -> tuple[dict, str]:
    u = uid()
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.ask",
        "WFWorkflowActionParameters": {
            "WFAskActionPrompt": prompt,
            "WFInputType": "Text",
            "WFAskActionDefaultAnswer": "",
            "UUID": u,
            "CustomOutputName": output_name,
        }
    }, u

def set_var(name: str) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.setvariable",
        "WFWorkflowActionParameters": {
            "WFVariableName": name,
            "UUID": uid(),
        }
    }

def choose_from_list(prompt: str, items: list[str], output_name: str) -> tuple[dict, str]:
    u = uid()
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.choosefromlist",
        "WFWorkflowActionParameters": {
            "WFChooseFromListActionPrompt": prompt,
            "WFChooseFromListActionList": [
                {"WFItemType": 0, "WFValue": static_text(item)} for item in items
            ],
            "UUID": u,
            "CustomOutputName": output_name,
        }
    }, u

def get_text(text_value: dict, output_name: str) -> tuple[dict, str]:
    u = uid()
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.gettext",
        "WFWorkflowActionParameters": {
            "WFTextActionText": text_value,
            "UUID": u,
            "CustomOutputName": output_name,
        }
    }, u

def current_date(output_name: str) -> tuple[dict, str]:
    u = uid()
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.date",
        "WFWorkflowActionParameters": {
            "UUID": u,
            "CustomOutputName": output_name,
        }
    }, u

def format_date(input_var_name: str, output_name: str) -> tuple[dict, str]:
    u = uid()
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.format.date",
        "WFWorkflowActionParameters": {
            "WFDateFormatStyle": "Custom",
            "WFDateFormat": "yyyy-MM-dd",
            "WFInput": named_var(input_var_name),
            "UUID": u,
            "CustomOutputName": output_name,
        }
    }, u

def post_url(url: str, headers: list[dict], body_fields: list[dict]) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.downloadurl",
        "WFWorkflowActionParameters": {
            "WFHTTPMethod": "POST",
            "WFURL": url,
            "WFHTTPBodyType": "JSON",
            "WFHTTPBody": {
                "Value": {"WFDictionaryFieldValueItems": body_fields},
                "WFSerializationType": "WFDictionaryFieldValue",
            },
            "WFHTTPHeaders": {
                "Value": {"WFDictionaryFieldValueItems": headers},
                "WFSerializationType": "WFDictionaryFieldValue",
            },
            "UUID": uid(),
        }
    }

def show_notification(title: str, body: str) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.notification",
        "WFWorkflowActionParameters": {
            "WFNotificationActionTitle": title,
            "WFNotificationActionBody": static_text(body),
            "WFNotificationActionSound": True,
            "UUID": uid(),
        }
    }

# ── Build shortcut ──────────────────────────────────────────────────────────

actions = []

# Step 0: Token text action (import question will replace its value on install)
token_action, token_uuid = get_text(static_text("PEGAR-TU-TOKEN-AQUI"), "Token")
actions.append(token_action)
actions.append(set_var("Token"))

# Step 1: Ask amount
importe_action, _ = ask_number("💶 ¿Cuánto?", "Importe")
actions.append(importe_action)
actions.append(set_var("Importe"))

# Step 2: Choose type
tipo_action, _ = choose_from_list(
    "¿Tipo de movimiento?",
    ["expense", "income"],
    "Tipo"
)
actions.append(tipo_action)
actions.append(set_var("Tipo"))

# Step 3: Choose category
cat_action, _ = choose_from_list(
    "¿Categoría?",
    ["Comida", "Transporte", "Ropa", "Salud", "Entretenimiento", "Hogar", "Trabajo", "Suscripciones", "Otros"],
    "Categoria"
)
actions.append(cat_action)
actions.append(set_var("Categoria"))

# Step 4: Ask description
nota_action, _ = ask_text("📝 Nota (opcional, deja vacío para omitir)", "Nota")
actions.append(nota_action)
actions.append(set_var("Nota"))

# Step 5: Get and format current date
date_raw_action, _ = current_date("FechaRaw")
actions.append(date_raw_action)
actions.append(set_var("FechaRaw"))

date_fmt_action, _ = format_date("FechaRaw", "Fecha")
actions.append(date_fmt_action)
actions.append(set_var("Fecha"))

# Step 6: POST to Supabase
headers = [
    dict_field("apikey", static_text(ANON_KEY)),
    dict_field("Content-Type", static_text("application/json")),
]
body = [
    dict_field("p_token",       named_var("Token")),
    dict_field("p_amount",      named_var("Importe")),
    dict_field("p_type",        named_var("Tipo")),
    dict_field("p_category",    named_var("Categoria")),
    dict_field("p_description", named_var("Nota")),
    dict_field("p_date",        named_var("Fecha")),
]
actions.append(post_url(SUPABASE_RPC, headers, body))

# Step 7: Notify success
actions.append(show_notification("FinanzApp ✅", "Movimiento añadido"))

# ── Import question for token ───────────────────────────────────────────────
import_questions = [
    {
        "ActionIndex": 0,
        "Category": "Parameter",
        "DefaultValue": "",
        "ParameterKey": "WFTextActionText",
        "Text": "Tu token personal de FinanzApp\n(App → Menú lateral → Atajo iPhone → Paso 1 → Copiar token)",
    }
]

# ── Assemble and write ──────────────────────────────────────────────────────
shortcut = {
    "WFWorkflowActions": actions,
    "WFWorkflowClientVersion": "1140.0.3",
    "WFWorkflowHasOutputFallback": False,
    "WFWorkflowIcon": {
        "WFWorkflowIconGlyphNumber": 59511,  # ⚡ lightning bolt
        "WFWorkflowIconStartColor": -1300911360,  # purple-blue
    },
    "WFWorkflowImportQuestions": import_questions,
    "WFWorkflowInputContentItemClasses": [],
    "WFWorkflowMinimumClientVersion": 900,
    "WFWorkflowMinimumClientVersionString": "900",
    "WFWorkflowName": "FinanzApp",
    "WFWorkflowNoInputBehavior": {
        "Name": "RunImmediately",
        "Parameters": {},
    },
    "WFWorkflowOutputContentItemClasses": [],
    "WFWorkflowTypes": ["NCWidget", "WatchKit"],
}

out_path = os.path.join(os.path.dirname(__file__), "..", "public", "finanzapp.shortcut")
out_path = os.path.normpath(out_path)

with open(out_path, "wb") as f:
    plistlib.dump(shortcut, f, fmt=plistlib.FMT_BINARY)

print(f"✅ Shortcut generado en: {out_path}")
print(f"   Acciones: {len(actions)}")
print(f"   Tamaño: {os.path.getsize(out_path)} bytes")
