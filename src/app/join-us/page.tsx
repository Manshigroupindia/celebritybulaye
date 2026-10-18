"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";
import { InstagramIcon, YouTubeIcon } from "@/components/common/SocialIcons";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useCategories } from "@/hooks/useCategories";
import { ArtistApplicationFormData } from "@/types";
import { submitArtistApplication, ApplicationSubmissionResponse } from "@/services/bookingService";

export default function JoinUsPage() {
  const { activeCategories } = useCategories();
  const [formData, setFormData] = useState<ArtistApplicationFormData>({
    fullName: "",
    professionalName: "",
    category: "",
    subcategory: "",
    phone: "",
    email: "",
    city: "",
    instagram: "",
    youtube: "",
    portfolioWebsite: "",
    experienceYears: "3 - 5 Years",
    aboutYou: "",
    profileImage: "",
    agreedToTerms: true,
  });

  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<ApplicationSubmissionResponse | null>(null);

  const selectedCategoryObj = activeCategories.find(
    (c) => c.name.toLowerCase() === formData.category.toLowerCase()
  );

  const activeSubcategories = (selectedCategoryObj?.subcategories || []).filter(
    (s) => s.status !== "inactive"
  );

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required.";
    if (!formData.professionalName.trim()) errs.professionalName = "Stage / Professional name is required.";
    if (!formData.category) errs.category = "Please select your primary category.";
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = "Please enter a valid phone number.";
    }
    if (!formData.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.city.trim()) errs.city = "City is required.";
    if (!formData.aboutYou.trim()) errs.aboutYou = "Please provide a brief bio and achievements.";
    if (!formData.agreedToTerms) errs.agreedToTerms = "Please agree to talent representation terms.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFileName(file.name);
      setFormData((prev) => ({
        ...prev,
        profileImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await submitArtistApplication(formData);
      setResponse(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed.";
      setErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setResponse(null);
    setImageFileName(null);
    setFormData({
      fullName: "",
      professionalName: "",
      category: "",
      subcategory: "",
      phone: "",
      email: "",
      city: "",
      instagram: "",
      youtube: "",
      portfolioWebsite: "",
      experienceYears: "3 - 5 Years",
      aboutYou: "",
      profileImage: "",
      agreedToTerms: true,
    });
    setErrors({});
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200/80 pt-8 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Join Us as Artist" }]} />

          <div className="mt-4 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#9B111E] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Artist & Talent Onboarding</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-serif mb-3">
              Want To Join Celebrity Bulaye?
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
              Join India&apos;s fastest growing verified talent network and connect directly with high-profile corporate galas, royal weddings, concerts, and brand campaigns.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {response ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center shadow-md animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 font-serif mb-2">
              Application Received!
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
              {response.message}
            </p>
            <div className="p-4 bg-gray-50 rounded-xl max-w-sm mx-auto text-xs text-gray-600 mb-8 border border-gray-200/60">
              <span className="font-semibold text-gray-500 block mb-1">Application Reference:</span>
              <span className="text-sm font-bold text-[#9B111E]">{response.applicationId}</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 bg-[#9B111E] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-[#740D16] transition-colors"
            >
              Submit Another Profile
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-md p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.form && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Personal & Stage Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Legal Name <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Vikram Sharma"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none ${
                        errors.fullName ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                      }`}
                    />
                  </div>
                  {errors.fullName && <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Professional / Stage Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="professionalName"
                    value={formData.professionalName}
                    onChange={handleChange}
                    placeholder="e.g. DJ Vik / Vikram Live"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none ${
                      errors.professionalName ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                    }`}
                  />
                  {errors.professionalName && <p className="mt-1 text-[11px] text-red-600">{errors.professionalName}</p>}
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Primary Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      handleChange(e);
                      setFormData((p) => ({ ...p, subcategory: "" }));
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none bg-white ${
                      errors.category ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                    }`}
                  >
                    <option value="">Select Category</option>
                    {activeCategories.map((c) => (
                      <option key={c.id || c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-[11px] text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Subcategory / Genre
                  </label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] bg-white"
                  >
                    <option value="">Select Subcategory</option>
                    {activeSubcategories.map((sub) => (
                      <option key={sub.slug} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Phone / WhatsApp <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none ${
                        errors.phone ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Official Email <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="artist@agency.com"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none ${
                        errors.email ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                      }`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
                </div>
              </div>

              {/* City & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Base City <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai, Delhi, Bangalore"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none ${
                        errors.city ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                      }`}
                    />
                  </div>
                  {errors.city && <p className="mt-1 text-[11px] text-red-600">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Performance Experience
                  </label>
                  <select
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] bg-white"
                  >
                    <option value="1 - 2 Years">1 - 2 Years (Emerging Artist)</option>
                    <option value="3 - 5 Years">3 - 5 Years (Established Talent)</option>
                    <option value="6 - 10 Years">6 - 10 Years (Senior Performer)</option>
                    <option value="10+ Years">10+ Years (Industry Veteran)</option>
                  </select>
                </div>
              </div>

              {/* Socials & Portfolio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Instagram Handle
                  </label>
                  <div className="relative">
                    <InstagramIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@handle"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#9B111E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    YouTube Channel
                  </label>
                  <div className="relative">
                    <YouTubeIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleChange}
                      placeholder="youtube.com/@channel"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#9B111E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Portfolio / Website
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="url"
                      name="portfolioWebsite"
                      value={formData.portfolioWebsite}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#9B111E]"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Image Upload Placeholder */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  High-Resolution Headshot / Press Kit Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-[#9B111E] transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-800">
                    {imageFileName ? `Selected: ${imageFileName}` : "Click or drag high-res portrait image"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    JPG, PNG or WEBP up to 10MB (Cloudinary integration ready)
                  </p>
                </div>
              </div>

              {/* About You Bio */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  About You & Performance Highlights <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="aboutYou"
                  rows={4}
                  value={formData.aboutYou}
                  onChange={handleChange}
                  placeholder="Share a short summary of your background, notable performances, shows done, awards, and what makes your act unique..."
                  className={`w-full p-3 text-xs sm:text-sm border rounded-xl outline-none ${
                    errors.aboutYou ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                  }`}
                />
                {errors.aboutYou && <p className="mt-1 text-[11px] text-red-600">{errors.aboutYou}</p>}
              </div>

              {/* Agreement */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-gray-300 text-[#9B111E] focus:ring-[#9B111E]"
                  />
                  <span className="text-xs text-gray-600 leading-snug">
                    I confirm that the details provided are accurate and I authorize Celebrity Bulaye to evaluate my artist profile for event and campaign representations.
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.agreedToTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-[#9B111E] hover:bg-[#740D16] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Artist Application</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
