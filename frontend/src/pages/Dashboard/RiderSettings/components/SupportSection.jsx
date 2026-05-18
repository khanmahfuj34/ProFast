import React, { useState } from "react";
import { FiHeadphones, FiUser, FiAlertTriangle, FiHelpCircle, FiMessageSquare, FiX, FiCheck } from "react-icons/fi";
import SettingsCard from "./SettingsCard";

const FAQ_ITEMS = [
  { q: "How do payout disbursements work?", a: "Payouts are processed automatically every Tuesday directly to your registered bank account or mobile wallet." },
  { q: "Can I update my preferred delivery areas anytime?", a: "Yes, you can edit your preferred areas under Location Settings. The matching algorithm updates instantly." },
  { q: "What should I do if a parcel is damaged?", a: "Use the 'Report Issue' action immediately and attach photos of the parcel before completing delivery." }
];

export default function SupportSection({ onSubmitSupport, isSubmitting }) {
  const [modalType, setModalType] = useState(null); // 'contact' | 'report' | 'faq'
  const [formData, setFormData] = useState({ subject: "", message: "" });

  const handleSubmit = async () => {
    if (!formData.subject || !formData.message) return;
    await onSubmitSupport({ ...formData, type: modalType });
    setFormData({ subject: "", message: "" });
    setModalType(null);
  };

  return (
    <SettingsCard
      icon={FiHeadphones}
      title="Support Section"
      description="Get help and support when you need it."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Contact Admin Card */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between items-start space-y-4">
          <div className="space-y-1">
            <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-3">
              <FiUser className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Contact Admin</h4>
            <p className="text-slate-500 text-xs leading-relaxed">Contact with platform administrator</p>
          </div>

          <button
            onClick={() => setModalType("contact")}
            className="flex items-center gap-2 px-3.5 py-2 border border-emerald-200 text-emerald-700 bg-emerald-50/70 rounded-xl font-bold text-xs hover:bg-emerald-100 transition cursor-pointer shadow-2xs w-full justify-center"
          >
            <FiHeadphones className="w-3.5 h-3.5" />
            Contact Now
          </button>
        </div>

        {/* Report Issue Card */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between items-start space-y-4">
          <div className="space-y-1">
            <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-3">
              <FiAlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Report Issue</h4>
            <p className="text-slate-500 text-xs leading-relaxed">Report any problem or issue</p>
          </div>

          <button
            onClick={() => setModalType("report")}
            className="flex items-center gap-2 px-3.5 py-2 border border-amber-200 text-amber-700 bg-amber-50/70 rounded-xl font-bold text-xs hover:bg-amber-100 transition cursor-pointer shadow-2xs w-full justify-center"
          >
            <FiAlertTriangle className="w-3.5 h-3.5" />
            Report Now
          </button>
        </div>

        {/* FAQ Card */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between items-start space-y-4">
          <div className="space-y-1">
            <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-3">
              <FiHelpCircle className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">FAQ</h4>
            <p className="text-slate-500 text-xs leading-relaxed">Find answers to common questions</p>
          </div>

          <button
            onClick={() => setModalType("faq")}
            className="flex items-center gap-2 px-3.5 py-2 border border-blue-200 text-blue-700 bg-blue-50/70 rounded-xl font-bold text-xs hover:bg-blue-100 transition cursor-pointer shadow-2xs w-full justify-center"
          >
            <FiHelpCircle className="w-3.5 h-3.5" />
            View FAQ
          </button>
        </div>
      </div>

      {/* Contact / Report Modal */}
      {(modalType === "contact" || modalType === "report") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {modalType === "contact" ? "Contact Administrator" : "Report an Issue"}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Payout inquiry or App freeze..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or question in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 transition resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.subject || !formData.message}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <FiCheck className="w-3.5 h-3.5" />
                {isSubmitting ? "Sending..." : "Submit Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {modalType === "faq" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-xl border border-slate-100 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Frequently Asked Questions</h3>
                <p className="text-slate-500 text-xs mt-0.5">Quick guides and answers for courier partners</p>
              </div>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <h5 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                    <span className="text-emerald-600">Q:</span> {item.q}
                  </h5>
                  <p className="text-xs text-slate-600 pl-5 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
              >
                Close FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsCard>
  );
}
