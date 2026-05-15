import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
    RiCloseLine, 
    RiFileTextLine, 
    RiPriceTag3Line, 
    RiFlag2Line, 
    RiImageAddLine,
    RiCheckboxCircleLine,
    RiCustomerService2Line
} from 'react-icons/ri';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useImageUpload from '../../../hooks/useImageUpload';

const CreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
    const axiosSecure = useAxiosSecure();
    const { uploadImage, uploading: imageUploading } = useImageUpload();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const mutation = useMutation({
        mutationFn: async (data) => {
            const res = await axiosSecure.post('/support/create', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Support ticket created successfully!');
            onSuccess();
            onClose();
            reset();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create ticket');
        }
    });

    const onSubmit = async (data) => {
        // Handle image upload if exists
        if (data.attachment && data.attachment[0]) {
            try {
                const imageUrl = await uploadImage(data.attachment[0]);
                data.attachment = imageUrl;
            } catch (err) {
                toast.error('Image upload failed');
                return;
            }
        } else {
            data.attachment = null;
        }

        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-lime-600 shadow-sm border border-slate-200">
                            <RiCustomerService2Line size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Create Support Ticket</h2>
                            <p className="text-slate-400 text-sm font-medium">Explain your issue and we'll get back to you</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-md flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                    >
                        <RiCloseLine size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Issue Category</label>
                            <div className="relative">
                                <RiPriceTag3Line className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select 
                                    {...register('category', { required: 'Category is required' })}
                                    className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="">Select Category</option>
                                    <option value="delivery_issue">Delivery Issue</option>
                                    <option value="payment_problem">Payment Problem</option>
                                    <option value="technical_bug">Technical Bug</option>
                                    <option value="account_access">Account Access</option>
                                    <option value="general_inquiry">General Inquiry</option>
                                </select>
                            </div>
                            {errors.category && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.category.message}</p>}
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Urgency / Priority</label>
                            <div className="relative">
                                <RiFlag2Line className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select 
                                    {...register('priority', { required: 'Priority is required' })}
                                    className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="">Select Priority</option>
                                    <option value="low">Low - General Question</option>
                                    <option value="medium">Medium - Fix Needed</option>
                                    <option value="high">High - Urgent Issue</option>
                                </select>
                            </div>
                            {errors.priority && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.priority.message}</p>}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                        <div className="relative group">
                            <RiFileTextLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lime-500 transition-colors" size={20} />
                            <input 
                                {...register('subject', { required: 'Subject is required' })}
                                placeholder="Briefly describe the issue"
                                className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                            />
                        </div>
                        {errors.subject && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.subject.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Detailed Description</label>
                        <textarea 
                            {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Please provide more details (min 20 chars)' } })}
                            rows={4}
                            placeholder="Tell us more about the problem you're facing..."
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all resize-none"
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.description.message}</p>}
                    </div>

                    {/* Screenshot Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Attachment (Optional)</label>
                        <div className="relative flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-100 border-dashed rounded-[24px] cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <RiImageAddLine size={24} className="text-slate-400 group-hover:text-lime-500 transition-colors" />
                                    <p className="text-xs text-slate-400 font-bold mt-2">Click to upload screenshot</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" {...register('attachment')} />
                            </label>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-50">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-8 h-12 text-slate-500 font-black hover:text-slate-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={mutation.isPending || imageUploading}
                            className="px-10 h-14 bg-slate-900 hover:bg-lime-500 disabled:bg-slate-200 text-white rounded-2xl font-black shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 active:scale-95 group/btn"
                        >
                            {mutation.isPending || imageUploading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <RiCheckboxCircleLine size={22} className="group-hover/btn:scale-125 transition-transform" />
                            )}
                            {mutation.isPending ? 'Submitting...' : imageUploading ? 'Uploading Image...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;
