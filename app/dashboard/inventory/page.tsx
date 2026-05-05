"use client"

import { useState, useEffect } from "react"
import { Plus, Package, Trash2, Edit2, Search, Filter, Loader2, DollarSign, Tag, Archive, X, ChevronDown, Lock } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils"
import { useSession } from "next-auth/react"
import Cookies from "js-cookie"
import { fetchProducts, upsertProduct, deleteProduct } from "@/lib/actions/inventory"
import { ArtisanSelect } from "@/components/ui/ArtisanSelect"
import { EmptyState } from "@/components/ui/EmptyState"
import { getCurrentUserRole } from "@/lib/actions/auth"
import { useSport } from "@/components/providers/SportProvider"
import { Toast, ToastType } from "@/components/ui/Toast"

export default function InventoryPage() {
  const { data: session } = useSession()
  const { facilityId } = useSport()
  
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "drink"
  })

  useEffect(() => {
    async function checkAuth() {
      if (facilityId) {
        const userRole = await getCurrentUserRole(facilityId)
        setRole(userRole)
      }
      setIsVerifying(false)
    }
    if (session?.user && facilityId) {
        checkAuth()
    }
  }, [session, facilityId])

  useEffect(() => {
    if (facilityId && (role === 'owner' || role === 'manager' || role === 'staff')) {
       loadProducts()
    }
  }, [role, facilityId])

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type })
  }

  const loadProducts = async () => {
    if (!facilityId) return
    setLoading(true)
    const data = await fetchProducts(facilityId)
    setProducts(data || [])
    setLoading(false)
  }

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category || "drink"
      })
    } else {
      setEditingProduct(null)
      setFormData({ name: "", price: "", category: "drink" })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facilityId) {
        showToast("Session Error: Facility ID not found.", "error")
        return
    }

    setIsSaving(true)
    try {
      const result = await upsertProduct({
        id: editingProduct?.id,
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category
      }, facilityId)

      if (result.success) {
        showToast(editingProduct ? "Product updated" : "Product added")
        await loadProducts()
        setIsModalOpen(false)
      } else {
        showToast(result.error || "Failed to save product", "error")
      }
    } catch (error) {
       showToast("An unexpected error occurred", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!facilityId) return

    if (!confirm("Are you sure you want to deactivate this product?")) return
    const result = await deleteProduct(id, facilityId)
    if (result.success) {
      showToast("Product deactivated")
      loadProducts()
    } else {
      showToast(result.error || "Failed to delete product", "error")
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Verifying Access...</p>
      </div>
    )
  }

  // Inventory is viewable by staff, but edits restricted by requireAdmin in actions
  if (role !== 'owner' && role !== 'manager' && role !== 'staff') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6 mesh-gradient rounded-[48px] border border-border/20">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Access Restricted</h2>
          <p className="text-muted-foreground text-xs max-w-xs mx-auto font-bold uppercase tracking-widest opacity-60">Inventory hub is restricted to facility personnel.</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard'} className="mt-4 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all">
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-700 pb-20 mesh-gradient p-1 rounded-[48px]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1 md:px-2">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-foreground leading-none mb-2">Inventory Hub</h1>
          <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] opacity-50">Manage your facility's products and services</p>
        </div>
        {(role === 'owner' || role === 'manager') && (
          <Button 
            onClick={() => handleOpenModal()}
            className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        )}
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1 md:px-2">
         <Card className="p-8 rounded-[40px] bg-card/60 backdrop-blur-xl border-border/40 relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Package className="h-32 w-32" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Total Products</p>
            <p className="text-4xl font-black italic tracking-tighter">{products.length}</p>
         </Card>
         <Card className="p-8 rounded-[40px] bg-card/60 backdrop-blur-xl border-border/40 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <DollarSign className="h-32 w-32" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Inventory Value</p>
            <p className="text-4xl font-black italic tracking-tighter uppercase">Active</p>
         </Card>
         <Card className="p-8 rounded-[40px] bg-card/60 backdrop-blur-xl border-border/40 relative overflow-hidden group hover:border-orange-500/20 transition-all">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Archive className="h-32 w-32" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">Stock Control</p>
            <p className="text-4xl font-black italic tracking-tighter uppercase">Enabled</p>
         </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 px-1 md:px-2">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card/50 border border-border/40 p-5 pl-14 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 ring-primary/10 transition-all placeholder:text-muted-foreground/30"
          />
        </div>
        <Button variant="ghost" className="h-16 px-8 rounded-2xl border border-border/40 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-muted/30">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
             <div key={i} className="h-64 bg-muted/10 animate-pulse rounded-[40px]" />
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={Package}
              title="Inventory Empty"
              description="You haven't added any products or services to your facility ledger yet."
              action={
                (role === 'owner' || role === 'manager') && (
                  <Button onClick={() => handleOpenModal()} className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg">
                    Add First Product
                  </Button>
                )
              }
            />
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="p-8 rounded-[40px] bg-card/60 backdrop-blur-xl border-border/40 group hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-primary/5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="h-14 w-14 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Tag className="h-6 w-6" />
                </div>
                {(role === 'owner' || role === 'manager') && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="p-3 rounded-xl bg-card border border-border/40 hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/20 transition-colors text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1 mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 italic">{product.category || 'Product'}</p>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">{product.name}</h3>
              </div>
              <div className="flex justify-between items-end border-t border-border/20 pt-6">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-1">Standard Market Price</p>
                   <p className="text-2xl font-black italic tracking-tighter text-foreground">{formatCurrency(product.price)}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">
                   Active Unit
                </div>
              </div>
              
              <Package className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform" />
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300">
           <Card className="bg-card w-full md:max-w-lg rounded-t-[32px] md:rounded-[40px] border border-border/50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 md:zoom-in duration-500">
              <div className="relative h-20 md:h-28 bg-primary/10 flex items-center px-6 md:px-10 border-b border-border/20">
                 <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Package className="h-28 w-28 -rotate-12" />
                 </div>
                 <h3 className="relative z-10 text-3xl font-black tracking-tighter italic uppercase text-foreground">
                    {editingProduct ? "Edit Product" : "Add Product"}
                 </h3>
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-card/50 transition-colors text-muted-foreground"
                 >
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <form onSubmit={handleSave} className="p-6 md:p-10 space-y-5 md:space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name</label>
                    <input 
                       required
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       placeholder="e.g. Water Bottle"
                       className="w-full h-14 bg-muted/30 border border-border/50 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price (NRS)</label>
                       <input 
                          required
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="0.00"
                          className="w-full h-14 bg-muted/30 border border-border/50 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                       />
                    </div>
                     <ArtisanSelect 
                        label="Category"
                        value={formData.category}
                        onChange={(val) => setFormData({...formData, category: val})}
                        options={[
                           { value: "drink", label: "💧 Drink / Water" },
                           { value: "food", label: "🍕 Food / Snacks" },
                           { value: "equipment", label: "⚽ Equipment" },
                           { value: "service", label: "🔧 Service" },
                           { value: "other", label: "📦 Other" }
                        ]}
                     />
                 </div>

                 <div className="flex gap-4 pt-6">
                    <Button 
                       type="button"
                       variant="ghost" 
                       onClick={() => setIsModalOpen(false)}
                       className="flex-1 h-16 rounded-[24px] font-black uppercase tracking-widest text-xs"
                    >
                       Cancel
                    </Button>
                    <Button 
                       type="submit"
                       disabled={isSaving}
                       className="flex-1 h-16 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                    >
                       {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingProduct ? "Update Product" : "Save Product"}
                    </Button>
                 </div>
              </form>
           </Card>
        </div>
      )}
      {/* Toast Feedback */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}
