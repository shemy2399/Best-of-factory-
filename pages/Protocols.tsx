import React, { useState } from 'react';
import { TreatmentProtocol } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '../components/icons';

interface ProtocolsPageProps {
  protocols: TreatmentProtocol[];
  onAddProtocol: (protocol: Omit<TreatmentProtocol, 'id'>) => void;
  onEditProtocol: (protocol: TreatmentProtocol) => void;
  onDeleteProtocol: (protocolId: string) => void;
}

const ProtocolModal: React.FC<{
  protocol?: TreatmentProtocol;
  onClose: () => void;
  onSave: (protocol: Omit<TreatmentProtocol, 'id'> | TreatmentProtocol) => void;
}> = ({ protocol, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    diagnosisName: protocol?.diagnosisName || '',
    treatmentTemplate: protocol?.treatmentTemplate || '',
  });
  const isEditing = !!protocol;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      onSave({ ...protocol, ...formData });
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{isEditing ? 'تعديل بروتوكول العلاج' : 'إضافة بروتوكول جديد'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="diagnosisName" value={formData.diagnosisName} onChange={handleChange} placeholder="اسم التشخيص" className="p-3 w-full bg-gray-700 border border-gray-600 rounded-lg" required />
          <textarea name="treatmentTemplate" value={formData.treatmentTemplate} onChange={handleChange} placeholder="قالب العلاج..." rows={5} className="p-3 w-full bg-gray-700 border border-gray-600 rounded-lg" required />
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600">{isEditing ? 'حفظ التعديلات' : 'إضافة'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProtocolsPage: React.FC<ProtocolsPageProps> = ({ protocols, onAddProtocol, onEditProtocol, onDeleteProtocol }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<TreatmentProtocol | null>(null);

  const handleSave = (protocolData: Omit<TreatmentProtocol, 'id'> | TreatmentProtocol) => {
    if ('id' in protocolData) {
      onEditProtocol(protocolData);
    } else {
      onAddProtocol(protocolData);
    }
  };

  return (
    <div className="space-y-6">
      {(isModalOpen || editingProtocol) && (
        <ProtocolModal
          protocol={editingProtocol || undefined}
          onClose={() => { setIsModalOpen(false); setEditingProtocol(null); }}
          onSave={handleSave}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">إدارة بروتوكولات العلاج</h1>
          <p className="text-gray-400 mt-2">إنشاء وتعديل قوالب العلاج الجاهزة للحالات الشائعة.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 shadow-md">
          <PlusIcon className="w-5 h-5 ml-2" />
          إضافة بروتوكول جديد
        </button>
      </div>

      <div className="bg-gray-700 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-900/50">
                <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">التشخيص</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">قالب العلاج</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الإجراءات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
                {protocols.length > 0 ? protocols.map(protocol => (
                <tr key={protocol.id} className="hover:bg-gray-600/50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-100">{protocol.diagnosisName}</td>
                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-300">{protocol.treatmentTemplate}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2 space-x-reverse">
                    <button onClick={() => setEditingProtocol(protocol)} className="text-gray-400 hover:text-gray-200 p-2 rounded-md hover:bg-gray-800/50"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => onDeleteProtocol(protocol.id)} className="text-red-500 hover:text-red-400 p-2 rounded-md hover:bg-gray-800/50"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                </tr>
                )) : (
                <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-400">
                        لا توجد بروتوكولات مسجلة. انقر على "إضافة بروتوكول جديد" للبدء.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ProtocolsPage;