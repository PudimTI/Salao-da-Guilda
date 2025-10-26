import React from 'react';

const systems = ['Todos', 'Dungeons & Dragons', 'Ordem Paranormal', 'Tormenta20', 'Call of Cthulhu'];
const themes = ['Todos', 'Fantasia', 'Investigação', 'Terror', 'Sci-Fi'];

const CampaignFilters = ({ filters, onChange }) => {
    const set = (key, value) => onChange({ ...filters, [key]: value });

    return (
        <section>
            <h2 className="text-gray-700 font-semibold mb-4">Filtros</h2>
            <div className="grid md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm text-gray-500 mb-1">Sistema</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2" value={filters.system} onChange={(e) => set('system', e.target.value)}>
                        {systems.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-500 mb-1">Temática</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2" value={filters.theme} onChange={(e) => set('theme', e.target.value)}>
                        {themes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-500 mb-1">Tags</label>
                    <input className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Insira a tag" />
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-4">
                    <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" className="rounded" checked={filters.sensitive} onChange={(e) => set('sensitive', e.target.checked)} />
                        <span className="text-sm text-gray-600">Filtro sensível</span>
                    </label>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium">Buscar</button>
                </div>
            </div>

            <div className="mt-3 flex items-center space-x-4">
                <span className="text-sm text-gray-600">Tags selecionadas</span>
                <span className="inline-flex items-center text-xs text-gray-700 bg-gray-100 border border-gray-300 px-2 py-1 rounded">Investigação</span>
                <span className="inline-flex items-center text-xs text-gray-700 bg-gray-100 border border-gray-300 px-2 py-1 rounded">Focado em RP</span>
            </div>
        </section>
    );
};

export default CampaignFilters;




