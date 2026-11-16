"use client";

import React, { useState } from "react";
import { Plus, Trash2, Database, Save, CheckCircle2, AlertCircle } from "lucide-react";

interface FieldDef {
  name: string;
  type: "string" | "text" | "richtext" | "number" | "boolean" | "date" | "media" | "enumeration";
  required: boolean;
  min?: number;
  max?: number;
  enumValues?: string;
}

interface ContentTypeSchema {
  name: string;
  singularName: string;
  pluralName: string;
  fields: FieldDef[];
}

const existingSchemas: ContentTypeSchema[] = [
  {
    name: "Article",
    singularName: "article",
    pluralName: "articles",
    fields: [
      { name: "title", type: "string", required: true, min: 3, max: 150 },
      { name: "content", type: "richtext", required: true },
      { name: "coverImage", type: "media", required: false },
      { name: "published", type: "boolean", required: false },
    ],
  },
  {
    name: "Product",
    singularName: "product",
    pluralName: "products",
    fields: [
      { name: "title", type: "string", required: true, min: 2 },
      { name: "price", type: "number", required: true, min: 0 },
      { name: "category", type: "enumeration", required: true, enumValues: "Hardware, Accessories, Software" },
      { name: "inStock", type: "boolean", required: false },
    ],
  },
];

export default function SchemaBuilderPage() {
  const [schemas, setSchemas] = useState<ContentTypeSchema[]>(existingSchemas);
  const [selectedSchema, setSelectedSchema] = useState<ContentTypeSchema>(existingSchemas[0]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New schema form state
  const [newTypeName, setNewTypeName] = useState("");
  const [newSingular, setNewSingular] = useState("");
  const [newPlural, setNewPlural] = useState("");
  const [fields, setFields] = useState<FieldDef[]>([
    { name: "title", type: "string", required: true, min: 2 },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const addField = () => {
    setFields([
      ...fields,
      { name: `field_${fields.length + 1}`, type: "string", required: false },
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof FieldDef, value: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const handleSaveNewSchema = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName || !newSingular || !newPlural) return;

    const newSchema: ContentTypeSchema = {
      name: newTypeName,
      singularName: newSingular,
      pluralName: newPlural.toLowerCase(),
      fields,
    };

    setSchemas([...schemas, newSchema]);
    setSelectedSchema(newSchema);
    setIsCreatingNew(false);
    setNewTypeName("");
    setNewSingular("");
    setNewPlural("");
    setNotification(`Schema "${newSchema.name}" created and dynamic REST API generated!`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Content-Type Schema Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Design dynamic content models and generate instant REST endpoints.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreatingNew ? "Cancel" : "Add Content Type"}</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold">✕</button>
        </div>
      )}

      {isCreatingNew ? (
        <form onSubmit={handleSaveNewSchema} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Create New Content Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={newTypeName}
                onChange={(e) => {
                  setNewTypeName(e.target.value);
                  setNewSingular(e.target.value.toLowerCase());
                  setNewPlural(`${e.target.value.toLowerCase()}s`);
                }}
                placeholder="e.g. Customer Testimonial"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Singular Name</label>
              <input
                type="text"
                required
                value={newSingular}
                onChange={(e) => setNewSingular(e.target.value)}
                placeholder="testimonial"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Plural API Slug</label>
              <input
                type="text"
                required
                value={newPlural}
                onChange={(e) => setNewPlural(e.target.value)}
                placeholder="testimonials"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fields Specification
              </h3>
              <button
                type="button"
                onClick={addField}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Field</span>
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((f, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={f.name}
                      onChange={(e) => updateField(idx, "name", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div className="w-40">
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Type</label>
                    <select
                      value={f.type}
                      onChange={(e) => updateField(idx, "type", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="string">String (Short)</option>
                      <option value="text">Text (Long)</option>
                      <option value="richtext">Rich Text</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                      <option value="media">Media File</option>
                      <option value="enumeration">Enumeration</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id={`req-${idx}`}
                      checked={f.required}
                      onChange={(e) => updateField(idx, "required", e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <label htmlFor={`req-${idx}`} className="text-xs text-slate-400">Required</label>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeField(idx)}
                    disabled={fields.length <= 1}
                    className="p-2 text-slate-500 hover:text-rose-400 disabled:opacity-30 pt-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Generate API</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Schema List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
              Existing Models
            </span>
            {schemas.map((s) => (
              <button
                key={s.pluralName}
                onClick={() => setSelectedSchema(s)}
                className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
                  selectedSchema.pluralName === s.pluralName
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/80"
                }`}
              >
                <div>
                  <span className="text-xs block">{s.name}</span>
                  <span className="text-[10px] opacity-60 font-mono">/api/v1/content/{s.pluralName}</span>
                </div>
                <span className="text-[10px] font-mono opacity-70">{s.fields.length} fields</span>
              </button>
            ))}
          </div>

          {/* Schema Details */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedSchema.name} Model</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Endpoint: GET /api/v1/content/{selectedSchema.pluralName}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-semibold">
                Active Schema
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Fields Specification
              </h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Field Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Required</th>
                      <th className="p-3">Validations / Constraints</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {selectedSchema.fields.map((f) => (
                      <tr key={f.name} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-white">{f.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px]">
                            {f.type}
                          </span>
                        </td>
                        <td className="p-3">
                          {f.required ? (
                            <span className="text-rose-400 font-semibold">Yes</span>
                          ) : (
                            <span className="text-slate-500">No</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400">
                          {f.min !== undefined && `min: ${f.min} `}
                          {f.max !== undefined && `max: ${f.max} `}
                          {f.enumValues && `[${f.enumValues}]`}
                          {!f.min && !f.max && !f.enumValues && "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
