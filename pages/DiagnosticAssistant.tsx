import React, { useState } from 'react';
import { getDiagnosticAssistance } from '../services/geminiService';
// FIX: Added missing import for DiagnosticAssistantIcon.
import { DiagnosticAssistantIcon } from '../components/icons';

// A simple component to render markdown-like text
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    return (
        <div className="space-y-4 text-right">
            {lines.map((line, index) => {
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold text-gray-100 mt-3">{line.substring(4)}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold text-amber-400 border-b border-gray-600 pb-2 mb-3">{line.substring(3)}</h2>;
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                     return <p key={index} className="font-bold text-gray-200">{line.substring(2, line.length - 2)}</p>;
                }
                if (line.startsWith('* ')) {
                    return <li key={index} className="mr-4 list-disc text-gray-300">{line.substring(2)}</li>;
                }
                 if (line.trim() === '---') {
                    return <hr key={index} className="border-gray-600 my-4" />;
                }
                return <p key={index} className="text-gray-300 leading-relaxed">{line}</p>;
            })}
        </div>
    );
};


const DiagnosticAssistantPage: React.FC = () => {
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symptoms.trim()) {
            setError('يرجى إدخال الأعراض للحصول على المساعدة.');
            return;
        }
        setIsLoading(true);
        setResult('');
        setError('');

        try {
            const response = await getDiagnosticAssistance(symptoms);
            setResult(response);
        } catch (err) {
            setError('فشل في الاتصال بمساعد التشخيص. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">مساعد التشخيص الذكي</h1>
                <p className="text-gray-400 mt-2">أدخل الأعراض السريرية للحصول على قائمة بالتشخيصات المحتملة وخطة عمل مقترحة.</p>
            </div>

            <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="symptoms" className="block text-lg font-medium text-gray-200 mb-2">الأعراض والملاحظات السريرية:</label>
                        <textarea
                            id="symptoms"
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="مثال: حصان يعاني من ارتفاع حرارة (39.5 درجة مئوية)، فقدان شهية، علامات مغص خفيفة، وجفاف الأغشية المخاطية..."
                            rows={6}
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                            aria-label="Clinical symptoms input"
                        />
                    </div>
                    {error && <p className="text-red-400">{error}</p>}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center justify-center px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    جاري التحليل...
                                </>
                            ) : (
                                <>
                                    <DiagnosticAssistantIcon className="w-5 h-5 ml-2" />
                                    الحصول على المساعدة
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {result && (
                <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4">نتائج التحليل:</h2>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                       <MarkdownRenderer text={result} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiagnosticAssistantPage;