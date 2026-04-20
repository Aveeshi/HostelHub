"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, CheckCircle, Link as LinkIcon, Plus, Trash2, Eye, RefreshCw, AlertTriangle } from "lucide-react";

export default function HostelMasterControl() {
    const [hostels, setHostels] = useState<any[]>([]);
    const [view, setView] = useState<"update" | "create" | "sync">("update");
    
    // Update State
    const [selectedHostel, setSelectedHostel] = useState("");
    const [urlInputs, setUrlInputs] = useState<string[]>(Array(15).fill(""));
    
    // Create State
    const [newHostel, setNewHostel] = useState({
        name: "",
        location: "Pune, Maharashtra",
        type: "Girls",
        description: "",
        price: 10000,
        facilities: "WiFi, AC, Laundry, Security"
    });
    const [createUrlInputs, setCreateUrlInputs] = useState<string[]>(Array(15).fill(""));

    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const fetchHostels = async () => {
        try {
            const res = await fetch("/api/hostels");
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setHostels(data);
            }
        } catch (err) {
            console.error("Failed to load hostels", err);
        }
    };

    useEffect(() => {
        fetchHostels();
    }, []);

    const selectedData = hostels.find(h => h.id === selectedHostel);

    // Smart Parser: Cleans a single URL string
    const cleanUrl = (url: string) => {
        let clean = url.trim();
        clean = clean.replace(/^["']|["']$/g, "");
        clean = clean.replace(/^[\[]|[\]]$/g, "");
        return clean.trim();
    };

    // Collect valid URLs from an array of 15 inputs
    const collectUrls = (inputs: string[]) => {
        return inputs
            .map(u => cleanUrl(u))
            .filter(u => u.length > 0 && u.startsWith('http'));
    };

    // Helper to update a single slot in either array
    const setUrlSlot = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => {
            const copy = [...prev];
            copy[index] = value;
            return copy;
        });
    };

    const handleUpdate = async () => {
        const newUrls = collectUrls(urlInputs);
        if (!selectedHostel || newUrls.length === 0) {
            setMessage("Please select a hostel and fill at least one URL box.");
            return;
        }

        setUploading(true);
        setMessage("");

        try {
            // REPLACE: New URLs fully replace old images (no more defaults)
            const newImagesArray = [...newUrls];

            const patchRes = await fetch(`/api/hostel-blocks/${selectedHostel}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ images: newImagesArray })
            });

            if (!patchRes.ok) throw new Error("Failed to save to database.");

            setMessage(`Successfully attached ${newUrls.length} image(s)! URL 1 is the new Cover.`);
            setUrlInputs(Array(15).fill(""));
            fetchHostels();
        } catch (error: any) {
            setMessage(`Update Failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async () => {
        if (!newHostel.name || !newHostel.description) {
            setMessage("Name and Description are required.");
            return;
        }

        setUploading(true);
        setMessage("");

        try {
            const imageUrls = collectUrls(createUrlInputs);
            const facilityList = newHostel.facilities.split(',').map(f => f.trim()).filter(f => f.length > 0);

            const res = await fetch("/api/hostels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    blockName: newHostel.name,
                    type: newHostel.type,
                    location: newHostel.location,
                    description: newHostel.description,
                    totalRooms: 50,
                    availableRooms: 15,
                    facilities: facilityList,
                    images: imageUrls,
                    wardenInfo: {
                        name: "Admin",
                        phone: "1800-200-300",
                        email: "admin@hostelhub.com"
                    }
                })
            });

            if (!res.ok) throw new Error("Failed to create hostel.");

            setMessage(`Successfully created ${newHostel.name}!`);
            setNewHostel({ name: "", location: "Pune, Maharashtra", type: "Girls", description: "", price: 10000, facilities: "WiFi, AC, Laundry, Security" });
            setCreateUrlInputs(Array(15).fill(""));
            fetchHostels();
            setView("update");
        } catch (error: any) {
            setMessage(`Creation Failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSync = async () => {
        if (!confirm("⚠️ DESTRUCTIVE ACTION: This will permanently delete ALL uploaded images and reset everything to mockData.js. Your Cloudinary URLs will be LOST forever. Are you absolutely sure?")) return;
        
        setUploading(true);
        setMessage("Syncing...");

        try {
            const res = await fetch("/api/seed-firebase?force=true");
            const data = await res.json();
            
            if (data.success) {
                setMessage("Database successfully reset and synced from file!");
                fetchHostels();
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            setMessage(`Sync Failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleClearImages = async () => {
        if (!selectedHostel || !confirm("Are you sure you want to delete ALL images for this hostel?")) return;
        
        setUploading(true);
        try {
            await fetch(`/api/hostel-blocks/${selectedHostel}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ images: [] })
            });
            setMessage("All images cleared.");
            fetchHostels();
        } catch (err) {
            setMessage("Failed to clear images.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-4xl font-black text-[#1e293b] tracking-tight mb-2">Hostel Master Control</h1>
                        <p className="text-slate-500 font-medium">Full control over your Cloudinary images and database sync.</p>
                    </div>
                    <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                        {["update", "create", "sync"].map((t) => (
                            <button 
                                key={t}
                                onClick={() => setView(t as any)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${view === t ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {message && (
                    <div className={`p-6 rounded-[2rem] text-sm font-bold flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${message.includes('Sync') || message.includes('Successfully') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        {message.includes('Successfully') ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-7 space-y-8">
                        {view === "update" && (
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        <LinkIcon size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800">Assign Cloudinary Images</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Select Specific Hostel</label>
                                        <select 
                                            className="w-full p-5 rounded-[1.5rem] bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-slate-700 font-bold transition-all appearance-none cursor-pointer"
                                            value={selectedHostel} 
                                            onChange={(e) => setSelectedHostel(e.target.value)}
                                        >
                                            <option value="">-- Choose from List --</option>
                                            {hostels.map(h => (
                                                <option key={h.id} value={h.id}>{h.name || h.blockName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Cloudinary Image URLs</label>
                                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                                            {urlInputs.map((val, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</span>
                                                    <input
                                                        type="text"
                                                        value={val}
                                                        onChange={(e) => setUrlSlot(i, e.target.value, setUrlInputs)}
                                                        placeholder={i === 0 ? 'Cover image URL (required)' : `Image URL ${i + 1} (optional)`}
                                                        className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm font-medium text-slate-700 transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mt-4">
                                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed">
                                                URL 1 = Cover Image. Fill only the boxes you need — empty boxes are ignored.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            onClick={handleUpdate}
                                            disabled={uploading || !selectedHostel}
                                            className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />} Update Images
                                        </button>
                                        <button 
                                            onClick={handleClearImages}
                                            disabled={uploading || !selectedHostel}
                                            className="px-8 bg-slate-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all font-bold"
                                            title="Clear all images"
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {view === "create" && (
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Plus size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800">Add New Property</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Hostel Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. ABC Hostel"
                                            value={newHostel.name}
                                            onChange={e => setNewHostel({...newHostel, name: e.target.value})}
                                            className="w-full p-5 rounded-[1.5rem] bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 font-bold text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Residency Type</label>
                                        <select 
                                            value={newHostel.type}
                                            onChange={e => setNewHostel({...newHostel, type: e.target.value})}
                                            className="w-full p-5 rounded-[1.5rem] bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                        >
                                            <option value="Girls">Girls</option>
                                            <option value="Boys">Boys</option>
                                            <option value="Co-ed">Co-ed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly Rent (₹)</label>
                                        <input 
                                            type="number" 
                                            value={newHostel.price}
                                            onChange={e => setNewHostel({...newHostel, price: parseInt(e.target.value)})}
                                            className="w-full p-5 rounded-[1.5rem] bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Facilities (Comma separated)</label>
                                    <input 
                                        type="text" 
                                        value={newHostel.facilities}
                                        onChange={e => setNewHostel({...newHostel, facilities: e.target.value})}
                                        className="w-full p-5 rounded-[1.5rem] bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
                                    <textarea 
                                        value={newHostel.description}
                                        onChange={e => setNewHostel({...newHostel, description: e.target.value})}
                                        className="w-full p-5 rounded-[1.5rem] bg-slate-50 border border-slate-200 outline-none font-bold resize-none text-slate-700"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Image URLs</label>
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                        {createUrlInputs.map((val, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</span>
                                                <input
                                                    type="text"
                                                    value={val}
                                                    onChange={(e) => setUrlSlot(i, e.target.value, setCreateUrlInputs)}
                                                    placeholder={i === 0 ? 'Cover image URL' : `Image ${i + 1} (optional)`}
                                                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 text-sm font-medium text-slate-700 transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCreate}
                                    disabled={uploading}
                                    className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="animate-spin" /> : <Plus size={18} />} Create Property
                                </button>
                            </div>
                        )}

                        {view === "sync" && (
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-10 text-center">
                                <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center shadow-inner mx-auto">
                                    <RefreshCw size={36} />
                                </div>
                                <div className="space-y-4 max-w-md mx-auto">
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Full System Sync</h2>
                                    <p className="text-slate-500 leading-relaxed font-medium"> This operation will wipe your current Firebase Database and reload everything from the <code className="bg-slate-100 px-2 py-0.5 rounded text-indigo-600">lib/mockData.js</code> file.</p>
                                </div>
                                
                                <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-700 space-y-4">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Trash2 size={18} />
                                        <span className="text-xs font-black uppercase tracking-[0.1em]">Caution: Irreversible Action</span>
                                    </div>
                                    <p className="text-xs font-bold leading-relaxed opacity-80">
                                        All manual image updates made via the "Update" tool and all custom properties created here will be permanently deleted from Firebase. Only data hardcoded in the mockData.js file will be restored.
                                    </p>
                                </div>

                                <button 
                                    onClick={handleSync}
                                    disabled={uploading}
                                    className="w-full py-6 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-3"
                                >
                                    {uploading ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />} Reset & Sync from File
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Preview */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 sticky top-12 min-h-[500px]">
                            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <Eye size={20} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Live Database Inspector</h3>
                            </div>

                            {!selectedHostel ? (
                                <div className="h-[400px] flex flex-col items-center justify-center text-center p-10">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                                        <LinkIcon size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Select a hostel on the left <br/> to inspect live data</p>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Firestore Document ID: <span className="text-indigo-600 ml-1">{selectedHostel}</span></div>
                                        <div className="text-2xl font-black text-slate-800">{selectedData?.name || selectedData?.blockName}</div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hostel Imagery ({selectedData?.images?.length || 0})</span>
                                            {selectedData?.images?.length > 0 && <span className="text-[8px] bg-slate-800 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter animate-pulse">Live</span>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                            {selectedData?.images?.map((url: string, i: number) => (
                                                <div key={i} className="relative group aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-indigo-400 transition-colors">
                                                    <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    {i === 0 && (
                                                        <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[8px] font-black uppercase px-2.5 py-1.5 rounded-lg shadow-lg">Cover Image</div>
                                                    )}
                                                </div>
                                            ))}
                                            {(selectedData?.images?.length || 0) === 0 && (
                                                <div className="col-span-2 h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 gap-2">
                                                    <Trash2 size={24} className="opacity-20" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">No images found</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Facilities</span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedData?.facilities?.map((f: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-lg">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

