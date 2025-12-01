import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, PlusSquare, Home, Camera, X, MoreHorizontal, Bookmark, Loader2, User } from 'lucide-react';

// --- Components ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center justify-center";
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300",
    secondary: "bg-gray-100 text-black hover:bg-gray-200 border border-gray-300",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// --- Configurações ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const currentUser = {
  id: 'user_dev_01',
  username: 'neon_developer',
  fullName: 'Neon Dev',
  avatar: 'https://ui-avatars.com/api/?name=Neon+Dev&background=0D8ABC&color=fff'
};

// URL ONDE O BACKEND ESTÁ RODANDO
const API_URL = 'http://localhost:3001';

export default function App() {
  const [view, setView] = useState('home');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Post State
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // --- API Functions ---

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (!res.ok) throw new Error('Falha na API');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Erro ao buscar posts. O servidor Node.js está rodando?", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostImage) return;
    setIsPublishing(true);

    const newPost = {
      id: generateId(),
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      imageUrl: newPostImage,
      caption: newPostCaption
    };

    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      
      if (res.ok) {
          await fetchPosts();
          setNewPostImage('');
          setNewPostCaption('');
          setView('home');
      } else {
          alert("Falha ao publicar. Erro na API.");
      }
    } catch (error) {
      alert("Erro ao publicar. Verifique se o server.js está rodando na porta 3001.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLike = async (postId) => {
    // Atualização otimista
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: (post.likes || 0) + 1 };
      }
      return post;
    }));

    try {
      await fetch(`${API_URL}/posts/${postId}/like`, { method: 'POST' });
    } catch (error) {
      console.error("Erro ao dar like no servidor.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // --- Views ---

  const renderHeader = () => (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4">
      <h1 className="text-xl font-bold font-serif tracking-wider text-gray-800">InstaNeon</h1>
      <div className="flex gap-4">
        <Heart size={24} className="text-gray-800 hover:text-red-500" />
        <MessageCircle size={24} className="text-gray-800 hover:text-blue-500" />
      </div>
    </div>
  );

  const renderBottomNav = () => (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 h-12 flex items-center justify-around z-50 pb-1 max-w-md mx-auto left-0 right-0">
      <button onClick={() => setView('home')} className={view === 'home' ? "text-black" : "text-gray-500 hover:text-black"}>
        <Home size={24} strokeWidth={view === 'home' ? 3 : 2} />
      </button>
      <button onClick={() => setView('create')} className={view === 'create' ? "text-black" : "text-gray-500 hover:text-black"}>
        <PlusSquare size={24} strokeWidth={view === 'create' ? 3 : 2} />
      </button>
      <button onClick={() => setView('profile')} className={view === 'profile' ? "text-black" : "text-gray-500 hover:text-black"}>
        <div className={`w-6 h-6 rounded-full overflow-hidden ${view === 'profile' ? 'border-2 border-black p-[1px]' : ''}`}>
           <img src={currentUser.avatar} className="w-full h-full rounded-full" />
        </div>
      </button>
    </div>
  );

  const renderFeed = () => (
    <div className="pb-16 max-w-md mx-auto">
      {loading ? (
        <div className="flex flex-col items-center justify-center pt-20 text-gray-500">
           <Loader2 className="animate-spin mb-2" size={32} />
           <p className="text-sm">Carregando posts do Neon DB...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg m-4 shadow-sm">
          <p className="font-semibold mb-2">Seu feed está vazio!</p>
          <p className="text-sm">Você está conectado ao seu banco Neon, mas ainda não há posts. Clique em 
          <span className="font-bold"> + </span> para criar um!</p>
          <p className="text-xs text-red-500 mt-4">Verifique se o seu servidor (server.js) está rodando na porta 3001.</p>
        </div>
      ) : (
        posts.map(post => (
          <article key={post.id} className="bg-white border-b border-gray-200 mb-2 last:mb-0">
            {/* Post Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                  <div className="w-full h-full bg-white rounded-full p-[2px]">
                     <img src={post.userAvatar || 'https://placehold.co/100x100/AAAAAA/FFFFFF?text=U'} className="w-full h-full rounded-full object-cover" alt="Avatar"/>
                  </div>
                </div>
                <span className="font-semibold text-sm">{post.username}</span>
              </div>
              <MoreHorizontal size={20} className="text-gray-600" />
            </div>

            {/* Post Image */}
            <div className="aspect-square bg-gray-100 w-full relative overflow-hidden">
              <img src={post.imageUrl} alt="Conteúdo do Post" className="w-full h-full object-cover" 
                   onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x600/6B7280/FFFFFF?text=Imagem+N%C3%A3o+Encontrada"; }}
              />
            </div>

            {/* Post Actions */}
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <button onClick={() => handleLike(post.id)} className="transition-transform active:scale-125 focus:outline-none">
                    <Heart size={26} className="text-black hover:fill-red-500 hover:text-red-500" />
                </button>
                <div className="flex gap-4">
                  <MessageCircle size={26} className="text-black -rotate-90 hover:text-gray-600" />
                  <Send size={26} className="text-black hover:text-gray-600" />
                </div>
                <Bookmark size={26} className="text-black hover:text-gray-600" />
              </div>

              <div className="font-semibold text-sm mb-1">{post.likes || 0} curtidas</div>
              
              <div className="text-sm">
                <span className="font-semibold mr-2">{post.username}</span>
                {post.caption}
              </div>
              
              <div className="text-gray-400 text-xs mt-1 uppercase">{post.timestamp}</div>
            </div>
          </article>
        ))
      )}
    </div>
  );

  const renderCreate = () => (
    <div className="p-4 max-w-md mx-auto h-screen bg-white flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="font-bold text-xl">Nova Publicação</h2>
            <button onClick={() => setView('home')} className="text-gray-600 hover:text-black">
                <X size={24} />
            </button>
        </div>

        <div className="space-y-4 flex-1">
            <div className="border border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 min-h-[250px] shadow-inner">
                {newPostImage ? (
                    <div className="relative w-full aspect-square">
                        <img src={newPostImage} className="w-full h-full object-contain rounded-md" alt="Preview"/>
                        <button 
                            onClick={() => setNewPostImage('')}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <Camera size={48} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-4">Insira a URL de uma imagem</p>
                        <input 
                            type="text" 
                            placeholder="https://..." 
                            className="w-full p-2 border border-blue-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setNewPostImage(e.target.value)}
                            value={newPostImage}
                        />
                    </>
                )}
            </div>

            <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Escreva uma legenda... (Ex: Minha primeira query no Neon!)"
                value={newPostCaption}
                onChange={(e) => setNewPostCaption(e.target.value)}
            />

            <Button 
                onClick={handleCreatePost} 
                className="w-full py-3" 
                disabled={!newPostImage || isPublishing}
            >
                {isPublishing ? <Loader2 className="animate-spin mr-2" /> : 'Compartilhar no InstaNeon'}
            </Button>
        </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white min-h-screen pb-16 max-w-md mx-auto">
      <div className="p-4 border-b border-gray-200">
         <div className="flex items-center gap-6 mb-4">
             <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                 <img src={currentUser.avatar} className="w-full h-full rounded-full border-2 border-white object-cover" alt="User Avatar"/>
             </div>
             <div className="flex-1">
                 <div className="flex gap-4 mb-2 justify-center">
                     <div className="text-center">
                         <div className="font-bold">{posts.filter(p => p.username === currentUser.username).length}</div>
                         <div className="text-xs text-gray-500">Publicações</div>
                     </div>
                     <div className="text-center">
                         <div className="font-bold">NEON</div>
                         <div className="text-xs text-gray-500">DB Status</div>
                     </div>
                 </div>
             </div>
         </div>
         <div className="mb-4">
             <div className="font-bold text-sm">{currentUser.fullName}</div>
             <div className="text-sm text-gray-600 flex items-center gap-1">
                <User size={14} /> @{currentUser.username}
             </div>
             <div className="text-xs text-green-600 mt-1 font-mono">Status: Online via API 3001</div>
         </div>
         <Button variant="secondary" className="w-full text-xs py-1.5 h-8">Editar Perfil</Button>
      </div>
      
      {/* Grid de Posts do Usuário */}
      <div className="grid grid-cols-3 gap-0.5">
         {posts.filter(p => p.username === currentUser.username).map(post => (
             <div key={post.id} className="aspect-square relative">
                 <img src={post.imageUrl} className="w-full h-full object-cover" alt="User Post"/>
             </div>
         ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative">
        {view !== 'create' && renderHeader()}
        
        <main>
            {view === 'home' && renderFeed()}
            {view === 'create' && renderCreate()}
            {view === 'profile' && renderProfile()}
        </main>

        {view !== 'create' && renderBottomNav()}
      </div>
    </div>
  );
}

