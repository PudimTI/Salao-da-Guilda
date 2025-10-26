import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

const MindmapPage = ({ campaignId }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isCreatingNode, setIsCreatingNode] = useState(false);
    const [isCreatingEdge, setIsCreatingEdge] = useState(false);
    const [edgeStartNode, setEdgeStartNode] = useState(null);
    const [newNode, setNewNode] = useState({ title: '', notes: '', pos_x: 0, pos_y: 0 });
    const [draggedNode, setDraggedNode] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    const containerRef = useRef(null);
    const svgRef = useRef(null);

    // Carregar dados iniciais
    useEffect(() => {
        if (campaignId) {
            loadMindmapData();
            loadAvailableFiles();
        }
    }, [campaignId]);

    // Carregar dados do mapa mental
    const loadMindmapData = async () => {
        try {
            setLoading(true);
            const response = await apiGet(`/api/campaigns/${campaignId}/mindmap`);
            if (response.success) {
                setNodes(response.data.nodes || []);
                setEdges(response.data.edges || []);
            }
        } catch (error) {
            console.error('Erro ao carregar mapa mental:', error);
            setError('Erro ao carregar mapa mental');
        } finally {
            setLoading(false);
        }
    };

    // Carregar arquivos disponíveis
    const loadAvailableFiles = async () => {
        try {
            const response = await apiGet(`/api/campaigns/${campaignId}/mindmap/files`);
            if (response.success) {
                setFiles(response.data || []);
            }
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
        }
    };

    // Criar novo nó
    const createNode = async (e) => {
        e.preventDefault();
        try {
            const response = await apiPost(`/api/campaigns/${campaignId}/mindmap/nodes`, newNode);
            if (response.success) {
                setNodes(prev => [...prev, response.data]);
                setNewNode({ title: '', notes: '', pos_x: 0, pos_y: 0 });
                setIsCreatingNode(false);
            }
        } catch (error) {
            console.error('Erro ao criar nó:', error);
            alert('Erro ao criar nó');
        }
    };

    // Atualizar nó
    const updateNode = async (nodeId, updates) => {
        try {
            const response = await apiPut(`/api/campaigns/${campaignId}/mindmap/nodes/${nodeId}`, updates);
            if (response.success) {
                setNodes(prev => prev.map(node => 
                    node.id === nodeId ? { ...node, ...updates } : node
                ));
            }
        } catch (error) {
            console.error('Erro ao atualizar nó:', error);
        }
    };

    // Deletar nó
    const deleteNode = async (nodeId) => {
        if (!confirm('Tem certeza que deseja deletar este nó?')) return;
        
        try {
            const response = await apiDelete(`/api/campaigns/${campaignId}/mindmap/nodes/${nodeId}`);
            if (response.success) {
                setNodes(prev => prev.filter(node => node.id !== nodeId));
                setEdges(prev => prev.filter(edge => 
                    edge.source_node_id !== nodeId && edge.target_node_id !== nodeId
                ));
                setSelectedNode(null);
            }
        } catch (error) {
            console.error('Erro ao deletar nó:', error);
            alert('Erro ao deletar nó');
        }
    };

    // Atualizar posição do nó (drag & drop)
    const updateNodePosition = async (nodeId, pos_x, pos_y) => {
        try {
            await apiPut(`/api/campaigns/${campaignId}/mindmap/nodes/${nodeId}/position`, {
                pos_x,
                pos_y
            });
        } catch (error) {
            console.error('Erro ao atualizar posição:', error);
        }
    };

    // Criar conexão
    const createEdge = async (sourceNodeId, targetNodeId, label = '') => {
        try {
            const response = await apiPost(`/api/campaigns/${campaignId}/mindmap/edges`, {
                source_node_id: sourceNodeId,
                target_node_id: targetNodeId,
                label
            });
            if (response.success) {
                setEdges(prev => [...prev, response.data]);
            }
        } catch (error) {
            console.error('Erro ao criar conexão:', error);
            alert('Erro ao criar conexão');
        }
    };

    // Deletar conexão
    const deleteEdge = async (edgeId) => {
        if (!confirm('Tem certeza que deseja deletar esta conexão?')) return;
        
        try {
            const response = await apiDelete(`/api/campaigns/${campaignId}/mindmap/edges/${edgeId}`);
            if (response.success) {
                setEdges(prev => prev.filter(edge => edge.id !== edgeId));
            }
        } catch (error) {
            console.error('Erro ao deletar conexão:', error);
            alert('Erro ao deletar conexão');
        }
    };

    // Iniciar criação de conexão
    const startCreatingEdge = (nodeId) => {
        if (isCreatingEdge) {
            if (edgeStartNode && edgeStartNode !== nodeId) {
                createEdge(edgeStartNode, nodeId);
            }
            setIsCreatingEdge(false);
            setEdgeStartNode(null);
        } else {
            setIsCreatingEdge(true);
            setEdgeStartNode(nodeId);
        }
    };

    // Iniciar drag do nó
    const startDrag = (e, node) => {
        e.preventDefault();
        setDraggedNode(node);
        const rect = containerRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left - node.pos_x,
            y: e.clientY - rect.top - node.pos_y
        });
    };

    // Atualizar posição durante drag
    const handleDrag = useCallback((e) => {
        if (!draggedNode) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const newX = e.clientX - rect.left - dragOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y;
        
        setNodes(prev => prev.map(node => 
            node.id === draggedNode.id 
                ? { ...node, pos_x: newX, pos_y: newY }
                : node
        ));
    }, [draggedNode, dragOffset]);

    // Finalizar drag
    const endDrag = useCallback((e) => {
        if (!draggedNode) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const newX = e.clientX - rect.left - dragOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y;
        
        updateNodePosition(draggedNode.id, newX, newY);
        setDraggedNode(null);
    }, [draggedNode, dragOffset]);

    // Event listeners para drag
    useEffect(() => {
        if (draggedNode) {
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', endDrag);
            return () => {
                document.removeEventListener('mousemove', handleDrag);
                document.removeEventListener('mouseup', endDrag);
            };
        }
    }, [draggedNode, handleDrag, endDrag]);

    // Renderizar conexões SVG
    const renderEdges = () => {
        return edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source_node_id);
            const targetNode = nodes.find(n => n.id === edge.target_node_id);
            
            if (!sourceNode || !targetNode) return null;
            
            const startX = sourceNode.pos_x + 100; // Centro do nó
            const startY = sourceNode.pos_y + 30;
            const endX = targetNode.pos_x + 100;
            const endY = targetNode.pos_y + 30;
            
            return (
                <g key={edge.id}>
                    <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="#94a3b8"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                    />
                    {edge.label && (
                        <text
                            x={(startX + endX) / 2}
                            y={(startY + endY) / 2}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#6b7280"
                            background="white"
                        >
                            {edge.label}
                        </text>
                    )}
                </g>
            );
        });
    };

    if (loading) {
        return (
            <div className="mindmap-container flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando mapa mental...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mindmap-container flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={loadMindmapData}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mindmap-container" ref={containerRef}>
            {/* SVG para conexões */}
            <svg
                ref={svgRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1 }}
            >
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                    >
                        <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill="#94a3b8"
                        />
                    </marker>
                </defs>
                {renderEdges()}
            </svg>

            {/* Toolbar */}
            <div className="mindmap-toolbar">
                <button
                    onClick={() => setIsCreatingNode(true)}
                    className="bg-green-600 text-white hover:bg-green-700"
                >
                    ➕ Novo Nó
                </button>
                <button
                    onClick={() => setIsCreatingEdge(!isCreatingEdge)}
                    className={isCreatingEdge ? 'active' : ''}
                >
                    🔗 {isCreatingEdge ? 'Cancelar Conexão' : 'Criar Conexão'}
                </button>
                <button
                    onClick={() => window.print()}
                >
                    🖨️ Imprimir
                </button>
                <button
                    onClick={() => window.history.back()}
                >
                    ← Voltar
                </button>
            </div>

            {/* Sidebar */}
            <div className="mindmap-sidebar">
                <h3>Arquivos Disponíveis</h3>
                <div className="space-y-2">
                    {files.map(file => (
                        <div key={file.id} className="mindmap-file-item">
                            <span className="text-sm text-gray-600">{file.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nós */}
            {nodes.map(node => (
                <div
                    key={node.id}
                    className={`mindmap-node ${selectedNode?.id === node.id ? 'selected' : ''} ${
                        edgeStartNode === node.id ? 'border-blue-500' : ''
                    }`}
                    style={{
                        left: node.pos_x,
                        top: node.pos_y,
                        zIndex: draggedNode?.id === node.id ? 1000 : 10
                    }}
                    onMouseDown={(e) => startDrag(e, node)}
                    onClick={() => {
                        if (isCreatingEdge) {
                            startCreatingEdge(node.id);
                        } else {
                            setSelectedNode(node);
                        }
                    }}
                >
                    <div className="mindmap-node-title">{node.title}</div>
                    {node.notes && (
                        <div className="mindmap-node-notes">{node.notes}</div>
                    )}
                    {node.files && node.files.length > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                            📎 {node.files.length} arquivo(s)
                        </div>
                    )}
                </div>
            ))}

            {/* Modal para criar nó */}
            {isCreatingNode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Criar Novo Nó</h3>
                        <form onSubmit={createNode}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={newNode.title}
                                    onChange={(e) => setNewNode({...newNode, title: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notas
                                </label>
                                <textarea
                                    value={newNode.notes}
                                    onChange={(e) => setNewNode({...newNode, notes: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingNode(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Criar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para editar nó selecionado */}
            {selectedNode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Editar Nó</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={selectedNode.title}
                                    onChange={(e) => setSelectedNode({...selectedNode, title: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notas
                                </label>
                                <textarea
                                    value={selectedNode.notes || ''}
                                    onChange={(e) => setSelectedNode({...selectedNode, notes: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => deleteNode(selectedNode.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Deletar
                            </button>
                            <button
                                onClick={() => {
                                    updateNode(selectedNode.id, {
                                        title: selectedNode.title,
                                        notes: selectedNode.notes
                                    });
                                    setSelectedNode(null);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Salvar
                            </button>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MindmapPage;
