"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SupportSidebar from "../SupportSidebar";
import { supabase } from "@/lib/supabase";
import { Spinner } from "../Common/PreLoader";

interface FormData {
  firstName: string;
  lastName: string;
  subject: string;
  phone: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  message?: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    subject: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Nama depan wajib diisi";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Nama belakang wajib diisi";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Pesan wajib diisi";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Pesan minimal 10 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isMountedState, setIsMountedState] = useState(true);

  useEffect(() => {
    return () => { setIsMountedState(false); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            subject: formData.subject,
            phone: formData.phone,
            message: formData.message
          }
        ]);

      if (error) throw error;

      if (isMountedState) {
        setSubmitStatus("success");
        setFormData({
          firstName: "",
          lastName: "",
          subject: "",
          phone: "",
          message: "",
        });

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          if (isMountedState) setSubmitStatus("idle");
        }, 5000);
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      if (isMountedState) {
        setSubmitStatus("error");
        setTimeout(() => {
          if (isMountedState) setSubmitStatus("idle");
        }, 5000);
      }
    } finally {
      if (isMountedState) setIsSubmitting(false);
    }
  };

  const inputBaseClass =
    "rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

  return (
    <>
      <Breadcrumb title={"Kontak"} pages={["kontak"]} />

      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* Sidebar */}
            <SupportSidebar />

            {/* Content Area */}
            <div className="flex-1 flex flex-col gap-7.5">
              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-xl shadow-1 border border-gray-3 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center text-blue mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <h4 className="font-bold text-dark mb-1">Telepon</h4>
                  <p className="text-dark-4 text-sm">+6288211346422</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-1 border border-gray-3 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center text-blue mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <h4 className="font-bold text-dark mb-1">Email</h4>
                  <p className="text-dark-4 text-sm">cs@seragamsekolah.co.id</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-1 border border-gray-3 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center text-blue mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <h4 className="font-bold text-dark mb-1">Alamat</h4>
                  <p className="text-dark-4 text-sm">Jl. Ulujami Raya, Gg. Rajai, No. 70, Blok F, RT.003/RW.04, Kel. Ulujami, Kec. Pesanggrahan, Kota Jakarta Selatan, DKI Jakarta, 12250</p>
                </div>
              </div>

              {/* Form Area */}
              <div className="bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-dark mb-2">Kirim Pesan</h3>
                  <p className="text-dark-4">Punya pertanyaan atau butuh bantuan khusus? Isi formulir di bawah ini.</p>
                </div>

                {/* Success Notification */}
                {submitStatus === "success" && (
                  <div className="mb-6 p-4 rounded-lg bg-green-light/10 border border-green-light/30 flex items-center gap-3 animate-fadeIn">
                    <svg className="shrink-0" width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <circle cx="11" cy="11" r="11" fill="#22C55E" fillOpacity="0.15"/>
                      <path d="M7 11L10 14L15 8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-green font-medium text-sm">
                      Pesan Anda berhasil dikirim! Tim kami akan segera merespons.
                    </p>
                  </div>
                )}

                {/* Error Notification */}
                {submitStatus === "error" && (
                  <div className="mb-6 p-4 rounded-lg bg-red/5 border border-red/20 flex items-center gap-3 animate-fadeIn">
                    <svg className="shrink-0" width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <circle cx="11" cy="11" r="11" fill="#EF4444" fillOpacity="0.15"/>
                      <path d="M8 8L14 14M14 8L8 14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p className="text-red font-medium text-sm">
                      Gagal mengirim pesan. Silakan coba lagi.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="firstName" className="block mb-2.5 font-medium text-dark text-sm">
                        Nama Depan <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Budi"
                        className={`${inputBaseClass} ${errors.firstName ? "border-red ring-1 ring-red/20" : "border-gray-3"}`}
                      />
                      {errors.firstName && (
                        <p className="text-red text-xs mt-1.5">{errors.firstName}</p>
                      )}
                    </div>

                    <div className="w-full">
                      <label htmlFor="lastName" className="block mb-2.5 font-medium text-dark text-sm">
                        Nama Belakang <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Santoso"
                        className={`${inputBaseClass} ${errors.lastName ? "border-red ring-1 ring-red/20" : "border-gray-3"}`}
                      />
                      {errors.lastName && (
                        <p className="text-red text-xs mt-1.5">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="subject" className="block mb-2.5 font-medium text-dark text-sm">
                        Subjek
                      </label>
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Ketik subjek Anda"
                        className={`${inputBaseClass} border-gray-3`}
                      />
                    </div>

                    <div className="w-full">
                      <label htmlFor="phone" className="block mb-2.5 font-medium text-dark text-sm">
                        Telepon
                      </label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Masukkan nomor telepon Anda"
                        className={`${inputBaseClass} border-gray-3`}
                      />
                    </div>
                  </div>

                  <div className="mb-7.5">
                    <label htmlFor="message" className="block mb-2.5 font-medium text-dark text-sm">
                      Pesan <span className="text-red">*</span>
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Ketik pesan Anda"
                      className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.message ? "border-red ring-1 ring-red/20" : "border-gray-3"}`}
                    ></textarea>
                    {errors.message && (
                      <p className="text-red text-xs mt-1.5">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 font-bold text-white bg-blue py-4 px-10 rounded-xl shadow-lg shadow-blue/20 ease-out duration-200 hover:bg-blue-dark hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="h-5 w-5 border-white" />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Pesan"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
