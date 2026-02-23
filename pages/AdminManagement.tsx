
import React, { useState } from 'react';
import { AdminUser, Page, ProtectedPageAccess } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, KeyIcon, CheckIcon } from '../components/icons';
import { NAV_ITEMS } from '../constants';

interface AdminManagementProps {
  admins: AdminUser[];
  onAddAdmin: (admin: Omit<AdminUser, 'id' | 'createdAt'>) => void;
  onEditAdmin: (admin: AdminUser) => void;
  onDeleteAdmin: (id: string) => void;
}

const BATTALIONS = ['الكل', 'الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];

const AdminModal: React.FC<{
  admin?: AdminUser;
  onClose: () => void;
  onSave: (admin: Omit<AdminUser, 'id' | 'createdAt'> | AdminUser) => Promise<void> | any;
}> = ({ admin, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: admin?.username || '',
    password: admin?.password || '',
    assignedBattalion: admin?.assignedBattalion || 'الكل',
    protectedPages: admin?.protectedPages || [] as ProtectedPageAccess[],
    hideAddHorseButton: admin?.hideAddHorseButton || false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const togglePageProtection = (pageId: Page) => {
    setFormData(prev => {
        const exists = prev.protectedPages.some(p => p.pageId === pageId);
        if (exists) {
            // Remove
            return { ...prev, protectedPages: prev.protectedPages.filter(p => p.pageId !== pageId) };
        } else {
            // Add with default empty code
            return { ...prev, protectedPages: [...prev.protectedPages, { pageId, accessCode: '' }] };
        }
    });
  };

  const updatePageCode = (pageId: Page, code: string) => {
      setFormData(prev => ({
          ...prev,
          protectedPages: prev.protectedPages.map(p => p.pageId === pageId ? { ...p, accessCode: code } : p)
      }));
  };

  const toggleHideAddHorse = () => {
    setFormData(prev => ({ ...prev, hideAddHorseButton: !prev.hideAddHorseButton }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all selected protected pages have a code
    const invalidPages = formData.protectedPages.filter(p => !p.accessCode.trim());
    if (invalidPages.length > 0) {
        alert("يجب تعيين رمز حماية لجميع الأقسام المختارة.");
        return;
    }

    setIsSaving(true);
    try {
        const payload = {
            username: formData.username,
            password: formData.password,
            assignedBattalion: formData.assignedBattalion,
            protectedPages: formData.protectedPages,
            hideAddHorseButton: formData.hideAddHorseButton
        };

        if (admin) {
          await onSave({ ...admin, ...payload });
        } else {
          await onSave(payload);
        }
        onClose();
    } catch (err) {
        console.error("Save error:", err);
        alert("حدث خطأ أثناء الحفظ.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[70] p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-3xl border border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white">{admin ? 'تعديل صلاحيات المستخدم' : 'إضافة مستخدم جديد'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-bold text-gray-300 text-sm">اسم المستخدم</label>
                <input 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-amber-500 focus:border-amber-500 outline-none font-bold" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 font-bold text-gray-300 text-sm">كلمة المرور</label>
                <input 
                  type="text"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-amber-500 focus:border-amber-500 outline-none font-mono" 
                  required 
                />
              </div>
          </div>

          <div>
             <label className="block mb-2 font-bold text-amber-400 text-sm">تخصيص الكتيبة (صلاحية العرض)</label>
             <select 
                value={formData.assignedBattalion}
                onChange={e => setFormData({...formData, assignedBattalion: e.target.value as any})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-amber-500 focus:border-amber-500 outline-none font-bold"
             >
                 {BATTALIONS.map(b => <option key={b} value={b}>{b}</option>)}
             </select>
             <p className="text-xs text-gray-400 mt-1">إذا تم تحديد كتيبة محددة، لن يرى المستخدم أي بيانات تخص الكتائب الأخرى.</p>
          </div>

          <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-700 flex items-center justify-between group transition-all hover:border-gray-600">
              <div className="flex flex-col gap-1">
                  <span className={`font-bold transition-colors ${formData.hideAddHorseButton ? 'text-red-400' : 'text-gray-300 group-hover:text-white'}`}>
                      صلاحية إضافة خيول جديدة
                  </span>
                  <p className="text-[10px] text-gray-500">
                      {formData.hideAddHorseButton ? 'المستخدم لا يملك صلاحية إضافة خيول' : 'المستخدم يمكنه إضافة خيول جديدة للقوة'}
                  </p>
              </div>
              <button 
                type="button"
                onClick={toggleHideAddHorse}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.hideAddHorseButton ? 'bg-red-600' : 'bg-gray-700'}`}
              >
                  <span 
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.hideAddHorseButton ? '-translate-x-5' : 'translate-x-0'}`} 
                  />
              </button>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
             <label className="block mb-3 font-bold text-amber-400 text-sm flex items-center gap-2">
                 <KeyIcon className="w-4 h-4" />
                 حماية الأقسام برمز خاص
             </label>
             <p className="text-xs text-gray-400 mb-4">حدد القسم واكتب رمز الأمان الخاص به الذي سيطلب من هذا المستخدم.</p>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {NAV_ITEMS.filter(item => item.id !== 'dashboard' && item.id !== 'admins').map(item => {
                     const protection = formData.protectedPages.find(p => p.pageId === item.id);
                     const isProtected = !!protection;

                     return (
                         <div key={item.id} className={`p-3 rounded-lg border transition-all ${isProtected ? 'bg-gray-800 border-amber-500/50 shadow-lg' : 'bg-gray-800/50 border-gray-700'}`}>
                             <label className="flex items-center gap-3 cursor-pointer mb-2">
                                 <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isProtected ? 'bg-amber-500 border-amber-500' : 'border-gray-500'}`}>
                                     {isProtected && <KeyIcon className="w-3 h-3 text-white" />}
                                 </div>
                                 <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={isProtected}
                                    onChange={() => togglePageProtection(item.id)}
                                 />
                                 <span className={`text-sm font-bold ${isProtected ? 'text-amber-300' : 'text-gray-300'}`}>{item.label}</span>
                             </label>
                             
                             {isProtected && (
                                 <div className="animate-fade-in mt-2">
                                     <input 
                                        type="text" 
                                        placeholder="اكتب رمز الحماية هنا"
                                        value={protection.accessCode}
                                        onChange={(e) => updatePageCode(item.id, e.target.value)}
                                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white text-center font-mono text-sm focus:border-amber-500 outline-none"
                                        maxLength={10}
                                        required
                                     />
                                 </div>
                             )}
                         </div>
                     );
                 })}
             </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-700">
            <button 
                type="submit" 
                disabled={isSaving}
                className={`px-8 py-3 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
              {isSaving ? 'جاري الحفظ...' : (admin ? 'حفظ التعديلات' : 'إضافة المستخدم')}
              {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfirmDeleteAdminModal: React.FC<{
  admin: AdminUser;
  onClose: () => void;
  onConfirm: (id: string) => void;
}> = ({ admin, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-[80] p-4 backdrop-blur-md">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center border border-red-500/30">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-6">
                    <TrashIcon className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-100">تأكيد حذف المستخدم</h3>
                <p className="text-gray-400 mt-2 text-sm">
                    هل أنت متأكد من رغبتك في حذف المستخدم <span className="font-bold text-white text-base">"{admin.username}"</span>؟
                </p>
                <div className="mt-8 flex gap-3">
                    <button
                        type="button"
                        onClick={() => onConfirm(admin.id)}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                    >
                        نعم، حذف
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-700 text-gray-300 font-bold rounded-xl hover:bg-gray-600 transition-all"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminManagement: React.FC<AdminManagementProps> = ({ admins, onAddAdmin, onEditAdmin, onDeleteAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);

  const handleDeleteClick = (admin: AdminUser) => {
    if (admins.length <= 1) {
        alert('لا يمكنك حذف آخر مستخدم في النظام! يجب أن يظل هناك مستخدم واحد على الأقل للوصول للبرنامج.');
        return;
    }
    setDeletingAdmin(admin);
  };

  const confirmDelete = (id: string) => {
    onDeleteAdmin(id);
    setDeletingAdmin(null);
  };

  return (
    <div className="space-y-6">
      {(isModalOpen || editingAdmin) && (
        <AdminModal 
          key={editingAdmin?.id || 'new'}
          admin={editingAdmin || undefined} 
          onClose={() => { setIsModalOpen(false); setEditingAdmin(null); }} 
          onSave={async (data) => {
            if ('id' in data) await onEditAdmin(data as AdminUser);
            else await onAddAdmin(data);
          }} 
        />
      )}

      {deletingAdmin && (
        <ConfirmDeleteAdminModal 
            admin={deletingAdmin}
            onClose={() => setDeletingAdmin(null)}
            onConfirm={confirmDelete}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">إدارة مستخدمي النظام</h1>
          <p className="text-gray-400 mt-2">يمكنك إضافة مستخدمين وتعيين كلمة مرور خاصة لكل قسم محمي.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
          <PlusIcon className="w-5 h-5 ml-2" />
          إضافة مستخدم جديد
        </button>
      </div>

      <div className="bg-gray-700 rounded-2xl shadow-xl overflow-hidden border border-gray-600">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600 text-right">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-gray-300 font-bold text-xs uppercase tracking-wider">اسم المستخدم</th>
                <th className="px-6 py-4 text-gray-300 font-bold text-xs uppercase tracking-wider">الكتيبة المخصصة</th>
                <th className="px-6 py-4 text-gray-300 font-bold text-xs uppercase tracking-wider">الحماية الخاصة</th>
                <th className="px-6 py-4 text-gray-300 font-bold text-xs uppercase tracking-wider text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-gray-600/30 transition-colors group">
                  <td className="px-6 py-4 text-white font-medium">
                      {admin.username}
                      <span className="block text-[10px] text-gray-500 font-mono mt-1">••••••••</span>
                      {admin.hideAddHorseButton && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[9px] font-bold">إضافة خيول معطلة</span>
                      )}
                  </td>
                  <td className="px-6 py-4">
                      {admin.assignedBattalion && admin.assignedBattalion !== 'الكل' ? (
                          <span className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-xs font-bold">{admin.assignedBattalion}</span>
                      ) : (
                          <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-xs font-bold">وصول كامل</span>
                      )}
                  </td>
                   <td className="px-6 py-4">
                      {admin.protectedPages && admin.protectedPages.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                              {admin.protectedPages.slice(0, 3).map(p => (
                                  <span key={p.pageId} className="px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px]" title={`رمز الدخول: ${p.accessCode}`}>{NAV_ITEMS.find(n => n.id === p.pageId)?.label}</span>
                              ))}
                              {admin.protectedPages.length > 3 && <span className="text-[10px] text-gray-500">+{admin.protectedPages.length - 3}</span>}
                          </div>
                      ) : (
                          <span className="text-gray-500 text-xs">لا توجد قيود</span>
                      )}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-start gap-2">
                        <button 
                            onClick={() => setEditingAdmin(admin)} 
                            className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                            title="تعديل"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(admin)} 
                            className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                            title="حذف"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
