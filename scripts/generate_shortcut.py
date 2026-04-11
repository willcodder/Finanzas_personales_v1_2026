#!/usr/bin/env python3
"""
Genera el archivo .shortcut de FinanzApp para iPhone.
Usa un cuerpo JSON como texto plano para máxima compatibilidad con iOS Shortcuts.
Ejecutar: python3 scripts/generate_shortcut.py
Salida:   public/finanzapp.shortcut
"""
import plistlib
import uuid
import os

SUPABASE_RPC = "https://hicijarieecjfhkaefsw.supabase.co/rest/v1/rpc/quick_add_transaction"
ANON_KEY    = "sb_publishable_-2miYdpSur7pXIIE5ESe8Q_Q1JQYhcI"

# ── Helpers ────────────────────────────────────────────────────────────────

def uid() -> str:
    return str(uuid.uuid4()).upper()

def static_text(s: str) -> dict:
    """Cadena estática como WFTextTokenString."""
    return {"Value": {"string": s}, "WFSerializationType": "WFTextTokenString"}

def interp(*parts) -> dict:
    """
    Construye un WFTextTokenString con variables interpoladas.
    Uso: interp("hola ", "@MiVar", " mundo")
         Los strings que empiezan por @ se tratan como variables.
    """
    text        = ""
    attachments = {}
    for part in parts:
        if isinstance(part, str) and part.startswith("@"):
            offset = len(text)
            text  += "\uFFFC"
            attachments[f"{{{offset}, 1}}"] = {
                "Type": "Variable",
                "VariableName": part[1:],
            }
        else:
            text += str(part)

    value: dict = {"string": text}
    if attachments:
        value["attachmentsByRange"] = attachments
    return {"Value": value, "WFSerializationType": "WFTextTokenString"}

def header_item(key: str, value: str) -> dict:
    return {
        "WFItemType": 0,
        "WFKey":   static_text(key),
        "WFValue": static_text(value),
    }

# ── Constructores de acciones ──────────────────────────────────────────────

def ask_number(prompt: str, out: str) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.ask",
        "WFWorkflowActionParameters": {
            "WFAskActionPrompt": prompt,
            "WFInputType": "Number",
            "WFAskActionDefaultAnswer": "",
            "UUID": uid(),
            "CustomOutputName": out,
        },
    }

def ask_text(prompt: str, out: str) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.ask",
        "WFWorkflowActionParameters": {
            "WFAskActionPrompt": prompt,
            "WFInputType": "Text",
            "WFAskActionDefaultAnswer": "",
            "UUID": uid(),
            "CustomOutputName": out,
        },
    }

def set_var(name: str) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.setvariable",
        "WFWorkflowActionParameters": {"WFVariableName": name, "UUID": uid()},
    }

def choose_list(prompt: str, items: list, out: str) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.choosefromlist",
        "WFWorkflowActionParameters": {
            "WFChooseFromListActionPrompt": prompt,
            "WFChooseFromListActionList": [
                {"WFItemType": 0, "WFValue": static_text(i)} for i in items
            ],
            "UUID": uid(),
            "CustomOutputName": out,
        },
    }

def get_text(text_token: dict, out: str) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.gettext",
        "WFWorkflowActionParameters": {
            "WFTextActionText": text_token,
            "UUID": uid(),
            "CustomOutputName": out,
        },
    }

def current_date(out: str) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.date",
        "WFWorkflowActionParameters": {"UUID": uid(), "CustomOutputName": out},
    }

def format_date(input_var: str, out: str) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.format.date",
        "WFWorkflowActionParameters": {
            "WFDateFormatStyle": "Custom",
            "WFDateFormat": "yyyy-MM-dd",
            "WFInput": interp("@" + input_var),
            "UUID": uid(),
            "CustomOutputName": out,
        },
    }

def http_post_raw(url: str, body_token: dict, headers: list) -> dict:
    """POST con cuerpo de texto plano (más compatible que JSON builder)."""
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.downloadurl",
        "WFWorkflowActionParameters": {
            "WFHTTPMethod": "POST",
            "WFURL": url,
            "WFHTTPBodyType": "File",          # texto plano → máxima compatibilidad
            "WFHTTPBody": body_token,
            "WFHTTPHeaders": {
                "Value": {"WFDictionaryFieldValueItems": headers},
                "WFSerializationType": "WFDictionaryFieldValue",
            },
            "UUID": uid(),
            "CustomOutputName": "Respuesta",
        },
    }

def show_result(title: str, body_var: str) -> dict:
    """Muestra la respuesta del servidor (útil para depurar)."""
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.notification",
        "WFWorkflowActionParameters": {
            "WFNotificationActionTitle": title,
            "WFNotificationActionBody": interp("@" + body_var),
            "WFNotificationActionSound": True,
            "UUID": uid(),
        },
    }

def show_alert(title: str, message: str) -> dict:
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.showresult",
        "WFWorkflowActionParameters": {
            "Text": static_text(message),
            "UUID": uid(),
        },
    }

# ── Construcción del Atajo ─────────────────────────────────────────────────

CATEGORIES = [
    "Comida", "Transporte", "Ropa", "Salud",
    "Entretenimiento", "Hogar", "Trabajo", "Suscripciones", "Otros",
]

actions = []

# 0. Token (el import question rellena este texto al instalar)
actions.append(get_text(static_text("PEGAR-TOKEN-AQUI"), "Token"))
actions.append(set_var("Token"))

# 1. Cantidad
actions.append(ask_number("💶 ¿Cuánto?", "Importe"))
actions.append(set_var("Importe"))

# 2. Tipo
actions.append(choose_list("¿Tipo?", ["expense", "income"], "Tipo"))
actions.append(set_var("Tipo"))

# 3. Categoría
actions.append(choose_list("📂 Categoría", CATEGORIES, "Categoria"))
actions.append(set_var("Categoria"))

# 4. Nota
actions.append(ask_text("📝 Nota (opcional)", "Nota"))
actions.append(set_var("Nota"))

# 5. Fecha actual formateada como yyyy-MM-dd
actions.append(current_date("FechaRaw"))
actions.append(set_var("FechaRaw"))
actions.append(format_date("FechaRaw", "Fecha"))
actions.append(set_var("Fecha"))

# 6. Construir JSON como texto
#    p_amount sin comillas para que Postgres lo reciba como número
json_body = get_text(
    interp(
        '{"p_token":"', "@Token",
        '","p_amount":', "@Importe",
        ',"p_type":"',  "@Tipo",
        '","p_category":"', "@Categoria",
        '","p_description":"', "@Nota",
        '","p_date":"', "@Fecha",
        '"}',
    ),
    "JSONBody",
)
actions.append(json_body)
actions.append(set_var("JSONBody"))

# 7. POST a Supabase
headers = [
    header_item("apikey",       ANON_KEY),
    header_item("Content-Type", "application/json"),
]
actions.append(http_post_raw(SUPABASE_RPC, interp("@JSONBody"), headers))
actions.append(set_var("Respuesta"))

# 8. Notificación de éxito (y respuesta por si hay error)
actions.append(show_result("FinanzApp", "Respuesta"))

# ── Import question: token al instalar ────────────────────────────────────

import_questions = [
    {
        "ActionIndex": 0,
        "Category": "Parameter",
        "DefaultValue": "",
        "ParameterKey": "WFTextActionText",
        "Text": "Tu token de FinanzApp\n(App → Menú → Atajo iPhone → Paso 2 → Copiar token)",
    }
]

# ── Ensamblado final ───────────────────────────────────────────────────────

shortcut = {
    "WFWorkflowActions": actions,
    "WFWorkflowClientVersion": "1140.0.3",
    "WFWorkflowHasOutputFallback": False,
    "WFWorkflowIcon": {
        "WFWorkflowIconGlyphNumber": 59511,   # rayo ⚡
        "WFWorkflowIconStartColor": -1300911360,
    },
    "WFWorkflowImportQuestions": import_questions,
    "WFWorkflowInputContentItemClasses": [],
    "WFWorkflowMinimumClientVersion": 900,
    "WFWorkflowMinimumClientVersionString": "900",
    "WFWorkflowName": "FinanzApp",
    "WFWorkflowNoInputBehavior": {"Name": "RunImmediately", "Parameters": {}},
    "WFWorkflowOutputContentItemClasses": [],
    "WFWorkflowTypes": ["NCWidget", "WatchKit"],
}

# ── Escribir archivo ───────────────────────────────────────────────────────

out = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "public", "finanzapp.shortcut")
)
with open(out, "wb") as f:
    plistlib.dump(shortcut, f, fmt=plistlib.FMT_BINARY)

print(f"✅  {out}")
print(f"   Acciones : {len(actions)}")
print(f"   Tamaño   : {os.path.getsize(out):,} bytes")

# Verificación rápida
with open(out, "rb") as f:
    check = plistlib.load(f)
print(f"   Nombre   : {check['WFWorkflowName']}")
print(f"   OK ✓")
