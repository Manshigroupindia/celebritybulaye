"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Check,
  AlertCircle,
  Sparkles,
  Trash2,
  Lock,
  Eye,
  CheckCircle2,
  Loader2,
  FileText,
  Briefcase,
  User,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { Celebrity, Category } from "@/types";
import { useCategories } from "@/hooks/useCategories";
import { uploadMediaFile } from "@/services/mediaService";

interface CelebrityWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  celebrityToEdit?: Celebrity | null;
  onSave: (data: Partial<Celebrity>, isDraft?: boolean) => Promise<{ success: boolean; error?: string }>;
}

const COMMON_LANGUAGES = [
  "Hindi",
  "English",
  "Punjabi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Malayalam",
  "Kannada",
  "Gujarati",
];

const COMMON_SERVICE_AREAS = [
  "Pan India",
  "International",
  "North India",
  "Delhi NCR",
  "Mumbai",
  "Chandigarh",
  "South India",
  "Middle East / UAE",
];

const STANDARD_EVENT_TYPES = [
  "Weddings",
  "Corporate Events",
  "Brand Events",
  "Concerts",
  "College Events",
  "Private Parties",
  "Award Functions",
  "Product Launches",
  "Social Events",
  "Government / Public Events",
];

export const CelebrityWizardModal: React.FC<CelebrityWizardModalProps> = ({
  isOpen,
  onClose,
  celebrityToEdit,
  onSave,
}) => {
  const { activeCategories } = useCategories();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategorySlug, setSubcategorySlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // Step 2 State
  const [experience, setExperience] = useState("8 Years");
  const [livingLocation, setLivingLocation] = useState("Mumbai, Maharashtra");
  const [languages, setLanguages] = useState<string[]>(["Hindi", "English"]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>(["Pan India", "International"]);
  const [customArea, setCustomArea] = useState("");
  const [availableFor, setAvailableFor] = useState<string[]>([
    "Weddings",
    "Corporate Events",
    "Brand Events",
  ]);
  const [specialties, setSpecialties] = useState<string[]>([
    "Live Performances",
    "Brand Endorsements",
    "Stage Appearances",
  ]);
  const [specialtyInput, setSpecialtyInput] = useState("");

  // Step 3 State
  const [biography, setBiography] = useState("");
  const [bookingProtocols, setBookingProtocols] = useState("");

  // Step 4 State
  const [mainImage, setMainImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "active" | "inactive">("active");
  const [featured, setFeatured] = useState(false);
  const [verified, setVerified] = useState(true);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [mainUploadProgress, setMainUploadProgress] = useState(0);
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (!isOpen) return;

    if (celebrityToEdit) {
      setName(celebrityToEdit.name || "");
      setSlug(celebrityToEdit.slug || "");
      setCategoryId(celebrityToEdit.categoryId || "");
      setCategoryName(celebrityToEdit.category || "");
      setCategorySlug(celebrityToEdit.categorySlug || "");
      setSubcategoryId(celebrityToEdit.subcategoryId || "");
      setSubcategoryName(celebrityToEdit.subcategory || "");
      setSubcategorySlug(celebrityToEdit.subcategorySlug || "");
      setShortDescription(celebrityToEdit.shortDescription || "");

      setExperience(celebrityToEdit.experience || (celebrityToEdit.experienceYears ? `${celebrityToEdit.experienceYears} Years` : "5 Years"));
      setLivingLocation(celebrityToEdit.livingLocation || celebrityToEdit.location || "");
      setLanguages(celebrityToEdit.languages && celebrityToEdit.languages.length > 0 ? celebrityToEdit.languages : ["Hindi", "English"]);
      setServiceAreas(celebrityToEdit.serviceAreas && celebrityToEdit.serviceAreas.length > 0 ? celebrityToEdit.serviceAreas : ["Pan India"]);
      setAvailableFor(celebrityToEdit.availableFor && celebrityToEdit.availableFor.length > 0 ? celebrityToEdit.availableFor : (celebrityToEdit.eventTypes || []));
      setSpecialties(celebrityToEdit.specialties || []);

      setBiography(celebrityToEdit.biography || celebrityToEdit.description || "");
      setBookingProtocols(celebrityToEdit.bookingProtocols || "");

      setMainImage(celebrityToEdit.mainImage || celebrityToEdit.profileImage || "");
      setGallery(celebrityToEdit.gallery || []);
      setStatus(celebrityToEdit.status || "active");
      setFeatured(Boolean(celebrityToEdit.featured));
      setVerified(celebrityToEdit.verified ?? true);
    } else {
      // New profile defaults
      setName("");
      setSlug("");
      if (activeCategories.length > 0) {
        setCategoryId(activeCategories[0].id || "");
        setCategoryName(activeCategories[0].name);
        setCategorySlug(activeCategories[0].slug);
      } else {
        setCategoryId("");
        setCategoryName("");
        setCategorySlug("");
      }
      setSubcategoryId("");
      setSubcategoryName("");
      setSubcategorySlug("");
      setShortDescription("");

      setExperience("8 Years");
      setLivingLocation("Mumbai, Maharashtra");
      setLanguages(["Hindi", "English"]);
      setServiceAreas(["Pan India", "International"]);
      setAvailableFor(["Weddings", "Corporate Events", "Brand Events"]);
      setSpecialties(["Live Performances", "Brand Endorsements", "Stage Appearances"]);

      setBiography("");
      setBookingProtocols("");

      setMainImage("");
      setGallery([]);
      setStatus("draft");
      setFeatured(false);
      setVerified(true);
    }

    setCurrentStep(1);
    setErrors({});
  }, [isOpen, celebrityToEdit, activeCategories]);

  // Selected Category Object for Subcategories Dropdown
  const selectedCategoryObj = activeCategories.find(
    (c) => c.slug.toLowerCase() === categorySlug.toLowerCase() || c.id === categoryId
  );

  const activeSubcategories = (selectedCategoryObj?.subcategories || []).filter(
    (s) => (s.status ?? "active") === "active"
  );

  // Handle Category Change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlug = e.target.value;
    const found = activeCategories.find((c) => c.slug === selectedSlug);

    if (found) {
      setCategoryName(found.name);
      setCategorySlug(found.slug);
      setCategoryId(found.id || "");
      // Reset subcategory if category changes
      setSubcategoryId("");
      setSubcategoryName("");
      setSubcategorySlug("");
    } else {
      setCategoryName("");
      setCategorySlug("");
      setCategoryId("");
      setSubcategoryId("");
      setSubcategoryName("");
      setSubcategorySlug("");
    }

    if (errors.category) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.category;
        return copy;
      });
    }
  };

  // Handle Subcategory Change
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubSlug = e.target.value;
    const foundSub = activeSubcategories.find((s) => s.slug === selectedSubSlug);

    if (foundSub) {
      setSubcategoryName(foundSub.name);
      setSubcategorySlug(foundSub.slug);
      setSubcategoryId(foundSub.id || "");
    } else {
      setSubcategoryName("");
      setSubcategorySlug("");
      setSubcategoryId("");
    }
  };

  // Tag helper for Specialties
  const addSpecialtyTag = (text: string) => {
    const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return;

    setSpecialties((prev) => {
      const combined = [...prev, ...parts];
      // Deduplicate
      return Array.from(new Set(combined));
    });
    setSpecialtyInput("");
  };

  const removeSpecialtyTag = (tag: string) => {
    setSpecialties((prev) => prev.filter((t) => t !== tag));
  };

  // Tag helper for Languages
  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const addCustomLanguage = () => {
    if (!customLanguage.trim()) return;
    const trimmed = customLanguage.trim();
    if (!languages.includes(trimmed)) {
      setLanguages((prev) => [...prev, trimmed]);
    }
    setCustomLanguage("");
  };

  // Tag helper for Service Areas
  const toggleServiceArea = (area: string) => {
    setServiceAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const addCustomServiceArea = () => {
    if (!customArea.trim()) return;
    const trimmed = customArea.trim();
    if (!serviceAreas.includes(trimmed)) {
      setServiceAreas((prev) => [...prev, trimmed]);
    }
    setCustomArea("");
  };

  // Event Types Checkbox toggle
  const toggleEventType = (event: string) => {
    setAvailableFor((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  // Main Image Upload
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploadingMain(true);
    setMainUploadProgress(0);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.mainImage;
      return copy;
    });

    try {
      const result = await uploadMediaFile(file, {
        presetType: "general",
        prefix: "celeb-main",
        onProgress: (p) => setMainUploadProgress(p),
      });
      if (result.success && result.url) {
        setMainImage(result.url);
      } else {
        setErrors((prev) => ({ ...prev, mainImage: result.error || "Image upload failed." }));
      }
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        mainImage: err instanceof Error ? err.message : "Upload error.",
      }));
    } finally {
      setIsUploadingMain(false);
      setMainUploadProgress(0);
      if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    }
  };

  // Gallery Multiple Images Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    setGalleryUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadMediaFile(file, {
          presetType: "general",
          prefix: "celeb-gal",
          onProgress: (p) => {
            const overall = Math.round(((i + p / 100) / files.length) * 100);
            setGalleryUploadProgress(overall);
          },
        });
        if (result.success && result.url) {
          uploadedUrls.push(result.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setGallery((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err: unknown) {
      console.error("Gallery upload error:", err);
    } finally {
      setIsUploadingGallery(false);
      setGalleryUploadProgress(0);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  const removeGalleryImage = (idxToRemove: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Validation Logic per step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!name.trim()) newErrors.name = "Celebrity name is required.";
      if (!categorySlug) newErrors.category = "Please select a category.";
      if (!shortDescription.trim()) {
        newErrors.shortDescription = "Short description is required.";
      } else if (shortDescription.trim().length < 20) {
        newErrors.shortDescription = "Short description should be at least 20 characters.";
      }
    } else if (step === 2) {
      if (!livingLocation.trim()) newErrors.livingLocation = "Living base location is required.";
      if (availableFor.length === 0) {
        newErrors.availableFor = "Select at least one event type the celebrity is available for.";
      }
    } else if (step === 3) {
      if (!biography.trim()) {
        newErrors.biography = "Full biography is required for the celebrity profile.";
      } else if (biography.trim().length < 50) {
        newErrors.biography = "Biography should be at least 50 characters.";
      }
    } else if (step === 4) {
      if (!mainImage) newErrors.mainImage = "Main portrait profile image is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  // Final Submit
  const handleFinalSubmit = async (publishStatus: "active" | "draft") => {
    // Validate all steps before publishing
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);
    const isStep4Valid = validateStep(4);

    if (!isStep1Valid) {
      setCurrentStep(1);
      return;
    }
    if (!isStep2Valid) {
      setCurrentStep(2);
      return;
    }
    if (!isStep3Valid) {
      setCurrentStep(3);
      return;
    }
    if (!isStep4Valid) {
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Partial<Celebrity> = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        category: categoryName,
        categorySlug,
        categoryId: categoryId || undefined,
        subcategory: subcategoryName,
        subcategorySlug,
        subcategoryId: subcategoryId || undefined,
        shortDescription: shortDescription.trim(),
        experience: experience.trim(),
        languages,
        serviceAreas,
        livingLocation: livingLocation.trim(),
        location: livingLocation.trim(),
        availableFor,
        eventTypes: availableFor,
        specialties,
        biography: biography.trim(),
        description: biography.trim(),
        bookingProtocols: bookingProtocols.trim(),
        mainImage,
        profileImage: mainImage,
        gallery,
        status: publishStatus,
        featured,
        verified,
      };

      const res = await onSave(payload, publishStatus === "draft");

      if (res.success) {
        onClose();
      } else {
        setErrors({ submit: res.error || "Failed to save profile." });
      }
    } catch (err: unknown) {
      setErrors({
        submit: err instanceof Error ? err.message : "An unexpected error occurred while saving.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-200 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0B0F19] to-[#1C1917] text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9B111E] to-[#740D16] border border-[#C5A059]/40 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-[#FFE5A3]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-serif tracking-tight">
                {celebrityToEdit ? `Edit Profile: ${celebrityToEdit.name}` : "Add New Celebrity Profile"}
              </h2>
              <p className="text-[11px] text-gray-400">
                4-Step Celebrity CMS Wizard with persistent real-time validation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Wizard Progress Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3.5">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { num: 1, label: "Basic Info", icon: User },
              { num: 2, label: "Professional", icon: Briefcase },
              { num: 3, label: "Biography", icon: FileText },
              { num: 4, label: "Media & Publish", icon: ImageIcon },
            ].map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    // Allow navigating backward or forward if validated
                    if (step.num < currentStep || validateStep(currentStep)) {
                      setCurrentStep(step.num as 1 | 2 | 3 | 4);
                    }
                  }}
                  className={`flex items-center gap-2 text-left transition-colors pb-1 border-b-2 ${
                    isActive
                      ? "border-[#9B111E] text-[#9B111E]"
                      : isCompleted
                      ? "border-emerald-600 text-emerald-800"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      isActive
                        ? "bg-[#9B111E] text-white"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <div className="hidden sm:block truncate">
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Step {step.num}
                    </span>
                    <span className="block text-xs font-semibold truncate leading-tight">
                      {step.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Current Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errors.submit && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* ================= STEP 1: Basic Information ================= */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 font-serif">
                  Step 1: Basic Information
                </h3>
                <p className="text-xs text-gray-500">
                  Enter the primary identity and categorical placement for the celebrity.
                </p>
              </div>

              {/* Celebrity Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Celebrity Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((p) => {
                        const copy = { ...p };
                        delete copy.name;
                        return copy;
                      });
                    }
                  }}
                  placeholder="e.g. Arjun Mehra"
                  className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl outline-none transition-colors ${
                    errors.name
                      ? "border-red-500 bg-red-50/20"
                      : "border-gray-200 focus:border-[#9B111E]"
                  }`}
                />
                {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
              </div>

              {/* Category & Subcategory Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Primary Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={categorySlug}
                    onChange={handleCategoryChange}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none bg-white transition-colors ${
                      errors.category
                        ? "border-red-500 bg-red-50/20"
                        : "border-gray-200 focus:border-[#9B111E]"
                    }`}
                  >
                    <option value="">Select Category</option>
                    {activeCategories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Subcategory / Genre (Optional)
                  </label>
                  <select
                    value={subcategorySlug}
                    onChange={handleSubcategoryChange}
                    disabled={!categorySlug || activeSubcategories.length === 0}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">
                      {!categorySlug
                        ? "Select category first"
                        : activeSubcategories.length === 0
                        ? "No subcategories available"
                        : "Select Subcategory"}
                    </option>
                    {activeSubcategories.map((sub) => (
                      <option key={sub.slug} value={sub.slug}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  {categorySlug && activeSubcategories.length === 0 && (
                    <p className="mt-1 text-[10px] text-gray-400">
                      No active subcategories under {categoryName}. You can add them in Categories CMS.
                    </p>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Short Description <span className="text-red-600">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-semibold ${
                      shortDescription.length > 300 ? "text-amber-600" : "text-gray-400"
                    }`}
                  >
                    {shortDescription.length} / 300 recommended chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => {
                    setShortDescription(e.target.value);
                    if (errors.shortDescription) {
                      setErrors((p) => {
                        const copy = { ...p };
                        delete copy.shortDescription;
                        return copy;
                      });
                    }
                  }}
                  placeholder="A concise, punchy teaser displayed on celebrity cards, directory grids, and search previews..."
                  className={`w-full p-3.5 text-xs sm:text-sm border rounded-xl outline-none transition-colors ${
                    errors.shortDescription
                      ? "border-red-500 bg-red-50/20"
                      : "border-gray-200 focus:border-[#9B111E]"
                  }`}
                />
                {errors.shortDescription && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.shortDescription}</p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: Professional Details ================= */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 font-serif">
                  Step 2: Professional Details
                </h3>
                <p className="text-xs text-gray-500">
                  Configure performance experience, available event formats, and location parameters.
                </p>
              </div>

              {/* Experience & Living Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 8 Years / 12+ Years"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#9B111E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Living Location / Base City <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={livingLocation}
                    onChange={(e) => {
                      setLivingLocation(e.target.value);
                      if (errors.livingLocation) {
                        setErrors((p) => {
                          const copy = { ...p };
                          delete copy.livingLocation;
                          return copy;
                        });
                      }
                    }}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none transition-colors ${
                      errors.livingLocation
                        ? "border-red-500 bg-red-50/20"
                        : "border-gray-200 focus:border-[#9B111E]"
                    }`}
                  />
                  {errors.livingLocation && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.livingLocation}</p>
                  )}
                </div>
              </div>

              {/* Available for Bookings (Multi-select) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Available For Bookings (Event Types) <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                  {STANDARD_EVENT_TYPES.map((evt) => {
                    const isChecked = availableFor.includes(evt);
                    return (
                      <button
                        key={evt}
                        type="button"
                        onClick={() => toggleEventType(evt)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors flex items-center justify-between ${
                          isChecked
                            ? "bg-red-50 border-[#9B111E] text-[#9B111E] font-bold"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="truncate">{evt}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#9B111E] shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
                {errors.availableFor && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.availableFor}</p>
                )}
              </div>

              {/* Languages (Multi-select + Custom) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Spoken / Performance Languages
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_LANGUAGES.map((lang) => {
                    const isSelected = languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-[#9B111E] text-white border-[#9B111E]"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {isSelected ? `✓ ${lang}` : `+ ${lang}`}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomLanguage();
                      }
                    }}
                    placeholder="Add other language..."
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#9B111E]"
                  />
                  <button
                    type="button"
                    onClick={addCustomLanguage}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Service Areas (Multi-select + Custom) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Service Travel Areas
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_SERVICE_AREAS.map((area) => {
                    const isSelected = serviceAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleServiceArea(area)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-[#9B111E] text-white border-[#9B111E]"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {isSelected ? `✓ ${area}` : `+ ${area}`}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomServiceArea();
                      }
                    }}
                    placeholder="Add custom service region..."
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#9B111E]"
                  />
                  <button
                    type="button"
                    onClick={addCustomServiceArea}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Specialties & Format Highlights (Comma-separated tag input) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Specialties & Format Highlights (Comma-separated)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addSpecialtyTag(specialtyInput);
                      }
                    }}
                    onBlur={() => {
                      if (specialtyInput.trim()) {
                        addSpecialtyTag(specialtyInput);
                      }
                    }}
                    placeholder="Type specialty and press Enter or comma (e.g. Live Singing, Keynote, Sangeet Act)..."
                    className="flex-1 px-3.5 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#9B111E]"
                  />
                  <button
                    type="button"
                    onClick={() => addSpecialtyTag(specialtyInput)}
                    className="px-3.5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800"
                  >
                    + Add Tag
                  </button>
                </div>
                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {specialties.map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#9B111E] border border-red-200/60 rounded-full text-xs font-semibold"
                      >
                        <span>{spec}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecialtyTag(spec)}
                          className="hover:text-red-900 p-0.5 rounded-full"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 3: Biography & Profile ================= */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 font-serif">
                  Step 3: Biography & Profile
                </h3>
                <p className="text-xs text-gray-500">
                  Provide detailed biographical content and booking coordination requirements.
                </p>
              </div>

              {/* Biography (Public) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Full Public Biography <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {biography.length} characters (Paragraphs & line breaks preserved)
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={biography}
                  onChange={(e) => {
                    setBiography(e.target.value);
                    if (errors.biography) {
                      setErrors((p) => {
                        const copy = { ...p };
                        delete copy.biography;
                        return copy;
                      });
                    }
                  }}
                  placeholder="Comprehensive career history, notable awards, major performances, cinematic achievements, and unique stage presence. Line breaks will be preserved on public profile..."
                  className={`w-full p-3.5 text-xs sm:text-sm border rounded-xl outline-none transition-colors ${
                    errors.biography
                      ? "border-red-500 bg-red-50/20"
                      : "border-gray-200 focus:border-[#9B111E]"
                  }`}
                />
                {errors.biography && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.biography}</p>
                )}
              </div>

              {/* Booking Protocols & Hospitality Rider (Private) */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <label className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Booking Protocols & Hospitality Rider (Private CMS Notes)
                    </label>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded">
                    Internal Only
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  Specify technical requirements, advance coordination, stage rider, accommodation tier, soundcheck requirements, and travel protocol. <strong>This information is never displayed on public pages.</strong>
                </p>
                <textarea
                  rows={4}
                  value={bookingProtocols}
                  onChange={(e) => setBookingProtocols(e.target.value)}
                  placeholder="e.g. Requires 2 Business Class flight tickets, 1 Presidential Suite and 2 Deluxe rooms at 5-star hotel. Technical rider requires Yamaha acoustic grand piano and Sennheiser wireless mic..."
                  className="w-full p-3 text-xs sm:text-sm border border-amber-200 rounded-xl outline-none focus:border-amber-600 bg-white"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 4: Images & Publish ================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 font-serif">
                  Step 4: Images & Media
                </h3>
                <p className="text-xs text-gray-500">
                  Upload high-resolution profile imagery and configure publishing status.
                </p>
              </div>

              {/* Main Profile Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Main Profile Image <span className="text-red-600">*</span>
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  Recommended: High-resolution portrait headshot (Aspect ratio 3:4 or 4:5, max 10MB JPG, PNG, WEBP).
                </p>

                {mainImage ? (
                  <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
                      <Image
                        src={mainImage}
                        alt="Profile preview"
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-gray-800">
                          Main Image Selected
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate max-w-md">{mainImage}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => mainFileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors"
                        >
                          Replace Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setMainImage("")}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => mainFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingMain(true);
                    }}
                    onDragLeave={() => setIsDraggingMain(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingMain(false);
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        handleMainImageUpload({ target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                      isDraggingMain
                        ? "border-[#9B111E] bg-red-50/40"
                        : errors.mainImage
                        ? "border-red-400 bg-red-50/20"
                        : "border-gray-300 hover:border-[#9B111E] bg-gray-50/50"
                    }`}
                  >
                    <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-800">
                      {isUploadingMain
                        ? `Uploading to Cloudinary (${mainUploadProgress}%)...`
                        : isDraggingMain
                        ? "Drop image to upload..."
                        : "Click or drag & drop Main Profile Portrait"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Accepts JPG, PNG, WEBP, GIF up to 10MB (Cloudinary cb-celebrities preset)
                    </p>
                    {isUploadingMain && (
                      <div className="w-48 mx-auto mt-3">
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#9B111E] h-full transition-all duration-200"
                            style={{ width: `${mainUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={mainFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleMainImageUpload}
                  className="hidden"
                />
                {errors.mainImage && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.mainImage}</p>
                )}
              </div>

              {/* Gallery Images (Multiple) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Additional Gallery Images (Optional)
                  </label>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {gallery.length} images added
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 pt-1 mb-3">
                  {gallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        aria-label="Remove image"
                        className="absolute top-1 right-1 p-1 bg-black/75 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    disabled={isUploadingGallery}
                    className="aspect-square border-2 border-dashed border-gray-300 hover:border-[#9B111E] rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-[#9B111E] transition-colors bg-gray-50"
                  >
                    {isUploadingGallery ? (
                      <div className="flex flex-col items-center justify-center p-1 text-center">
                        <Loader2 className="w-4 h-4 animate-spin text-[#9B111E] mb-1" />
                        <span className="text-[9px] font-bold text-gray-700">{galleryUploadProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mb-0.5" />
                        <span className="text-[10px] font-bold">Add Photo</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Status & Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Profile Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "draft" | "active" | "inactive")}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:border-[#9B111E] bg-white font-semibold"
                  >
                    <option value="active">Active (Published)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#9B111E] focus:ring-[#9B111E] border-gray-300"
                    />
                    <span className="text-xs font-semibold text-gray-800">
                      Show in Featured Celebrities
                    </span>
                  </label>
                </div>

                {/* Verified Checkbox */}
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verified}
                      onChange={(e) => setVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-[#9B111E] focus:ring-[#9B111E] border-gray-300"
                    />
                    <span className="text-xs font-semibold text-gray-800">
                      Mark as Verified Profile
                    </span>
                  </label>
                </div>
              </div>

              {/* Compact Review Summary Card */}
              <div className="p-4 bg-red-50/40 border border-red-100 rounded-2xl flex items-center gap-4">
                {mainImage ? (
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
                    <Image src={mainImage} alt={name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-16 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm font-serif">
                      {name || "Untitled Celebrity"}
                    </span>
                    <span className="text-[10px] font-bold bg-[#9B111E] text-white px-2 py-0.5 rounded-full">
                      {categoryName || "Category"}
                    </span>
                    {subcategoryName && (
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {subcategoryName}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {livingLocation} • {experience} • {availableFor.length} Event Types
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer / Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 transition-all"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFinalSubmit("draft")}
                  className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-300 shadow-xs transition-colors disabled:opacity-60"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFinalSubmit("active")}
                  className="px-5 py-2.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#FFE5A3]" />
                      <span>{celebrityToEdit ? "Update Profile" : "Publish Celebrity"}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
