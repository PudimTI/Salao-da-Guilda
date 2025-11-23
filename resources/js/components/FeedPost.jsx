import React, { useState } from 'react';
import TagList from './TagList';
import UserProfileCard from './UserProfileCard';
import ReportModal from './ReportModal';

const FeedPost = ({ post, onLike, onRepost, onComment, onTagClick = null }) => {
    const [isLiking, setIsLiking] = useState(false);
    const [isReposting, setIsReposting] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [showUserCard, setShowUserCard] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        try {
            await onLike(post.id);
        } finally {
            setIsLiking(false);
        }
    };

    const handleRepost = async () => {
        if (isReposting) return;
        setIsReposting(true);
        try {
            await onRepost(post.id);
        } finally {
            setIsReposting(false);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        try {
            await onComment(post.id, newComment);
            setNewComment('');
        } catch (error) {
            console.error('Erro ao comentar:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Agora';
        if (diffInHours < 24) return `${diffInHours}h`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <>
        <article className="border border-gray-200 rounded-xl overflow-hidden">
            <header className="flex items-center justify-between px-6 pt-6">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {post.author.avatar_url ? (
                            <img 
                                src={post.author.avatar_url} 
                                alt={post.author.display_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        )}
                    </div>
                    <div>
                        <button 
                            onClick={() => setShowUserCard(true)}
                            className="text-left hover:opacity-80 transition-opacity"
                        >
                            <div className="text-gray-800 font-semibold">
                                {post.author.display_name} <span className="text-gray-500 font-normal">@{post.author.handle}</span>
                            </div>
                            <div className="text-gray-400 text-sm">
                                {formatDate(post.created_at)}
                            </div>
                        </button>
                    </div>
                </div>
                <div className="text-gray-400">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-600 transition"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9l3 6H9l3-6zm0 8h.01" />
                        </svg>
                        <span>Denunciar</span>
                    </button>
                </div>
            </header>

            <div className="px-6 py-4">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-3">
                        <TagList 
                            tags={post.tags} 
                            showType={true}
                            className="gap-1"
                            tagClassName="text-xs"
                            onTagClick={onTagClick}
                        />
                    </div>
                )}
                
                {/* Media */}
                {post.media && post.media.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 gap-2">
                        {post.media.map((media, index) => (
                            <div key={index} className="relative">
                                {media.type.startsWith('image/') ? (
                                    <img 
                                        src={media.url} 
                                        alt={`Mídia ${index + 1}`}
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                ) : (
                                    <video 
                                        src={media.url} 
                                        controls
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <footer className="px-6 pb-6">
                <div className="flex items-center justify-between text-gray-500">
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`flex items-center space-x-2 hover:text-gray-700 ${post.is_liked ? 'text-red-500' : ''} ${isLiking ? 'opacity-50' : ''}`}
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={post.is_liked ? 'currentColor' : 'none'} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 9l-3 3 3 3" />
                            </svg>
                            <span>{post.likes_count || 0}</span>
                        </button>
                        <button 
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center space-x-2 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h6M5 20l4-4H19a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14z" />
                            </svg>
                            <span>{post.comments_count || 0}</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={handleRepost}
                            disabled={isReposting}
                            className={`hover:text-gray-700 ${post.is_reposted ? 'text-green-500' : ''} ${isReposting ? 'opacity-50' : ''}`}
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={post.is_reposted ? 'currentColor' : 'none'} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 17l-5 3 1.9-5.9L4 9h6l2-6 2 6h6l-4.9 5.1L17 20z" />
                            </svg>
                            <span className="ml-1">{post.reposts_count || 0}</span>
                        </button>
                        <button className="hover:text-gray-700">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v14" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 border-t pt-4">
                        <form onSubmit={handleComment} className="mb-4">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Escreva um comentário..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Comentar
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        {post.comments && post.comments.length > 0 && (
                            <div className="space-y-3">
                                {post.comments.map((comment) => (
                                    <div key={comment.id} className="flex space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {comment.author.avatar_url ? (
                                                <img 
                                                    src={comment.author.avatar_url} 
                                                    alt={comment.author.display_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-semibold text-sm">{comment.author.display_name}</span>
                                                    <span className="text-gray-500 text-sm">@{comment.author.handle}</span>
                                                    <span className="text-gray-400 text-xs">{formatDate(comment.created_at)}</span>
                                                </div>
                                                <p className="text-gray-800 text-sm">{comment.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </footer>
        </article>

        {/* Modal de perfil do usuário */}
        {showUserCard && (
            <UserProfileCard
                user={post.author}
                onClose={() => setShowUserCard(false)}
            />
        )}

        {/* Modal de denúncia */}
        {showReportModal && (
            <ReportModal
                isOpen={showReportModal}
                targetType="post"
                targetId={post.id}
                targetName={`Post de ${post.author?.display_name || post.author?.handle || 'usuário'}`}
                targetDescription={post.content?.slice(0, 180)}
                onClose={() => setShowReportModal(false)}
            />
        )}
        </>
    );
};

export default FeedPost;




