import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Edit3,
  FileText,
  Image,
  Plus,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import BorderGlow from "./BorderGlow";
import { darkModeGlowProps } from "./borderGlowTheme";
import { useTheme } from "./ThemeContext";
import { createExpense, processReceiptFile } from "../utils/api";
import { getCurrentLocalDate } from "../utils/dateUtils";

const defaultCategories = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Bills & Utilities",
  "Healthcare",
  "Entertainment",
  "Travel",
  "Education",
  "Groceries",
  "Other",
];

const emptyManualData = () => ({
  amount: "",
  category: "",
  date: getCurrentLocalDate(),
  items: [],
  currency: "INR",
});

const inferAmountFromExtractedText = (text, fallbackAmount) => {
  const cleanText = String(text || "").trim();
  const numericFallback = Number(fallbackAmount);
  if (!cleanText) return Number.isFinite(numericFallback) ? numericFallback : 0;

  const normalizedText = cleanText.replace(/\s+/g, " ").trim();
  const lines = cleanText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parseAmounts = (line) =>
    [...line.matchAll(/\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?/g)]
      .map((match) => Number(match[0].replace(/,/g, "")))
      .filter((value) => Number.isFinite(value) && value > 0);

  const isHeaderLikeNumber = (value) => {
    if (!Number.isFinite(value) || value < 10000 || !Number.isInteger(value)) {
      return false;
    }

    const variants = [String(value), `${value.toFixed(2)}`];
    return lines.some((line) => {
      const lower = line.toLowerCase();
      return (
        /new delhi|delhi|address|plot no|state code|phone|mobile|gst|gstin|invoice no|bill no|date & time/i.test(lower) &&
        variants.some((variant) => line.includes(variant))
      );
    });
  };

  const strongPayLabelPattern =
    /pls\.?\s+(?:p(?:a|f|b)y|fay|bay)|please\s+(?:p(?:a|f|b)y|fay|bay)|net\s+to\s+pay|grand\s+total|amount\s+due|total\s+payable|invoice\s+total|net\s+total/i;

  const findAmountAfterLabel = (sourceText, labels) => {
    for (const label of labels) {
      const pattern = new RegExp(
        `${label}[^\\d]{0,24}(\\d+(?:,\\d{3})*(?:\\.\\d{1,2})?)`,
        "i"
      );
      const match = sourceText.match(pattern);
      if (match) {
        const value = Number(match[1].replace(/,/g, ""));
        if (Number.isFinite(value) && value > 0 && !isHeaderLikeNumber(value)) {
          return value;
        }
      }
    }
    return 0;
  };

  const prioritizedLabeledAmount = findAmountAfterLabel(normalizedText, [
    "pls\\.?\\s+(?:p(?:a|f|b)y|fay|bay)",
    "please\\s+(?:p(?:a|f|b)y|fay|bay)",
    "net\\s+to\\s+pay",
    "grand\\s+total",
    "amount\\s+due",
    "total\\s+payable",
    "invoice\\s+total",
    "net\\s+total",
  ]);

  if (prioritizedLabeledAmount > 0) {
    return prioritizedLabeledAmount;
  }

  let subtotal = 0;
  let taxTotal = 0;
  let roundOff = 0;
  let rowCount = 0;

  for (const line of lines) {
    const lower = line.toLowerCase();
    const values = parseAmounts(line);
    if (!values.length) continue;

    if (strongPayLabelPattern.test(lower)) {
      return values[values.length - 1];
    }

    if (/\btotal\b/.test(lower) && !/subtotal|grand total|net to pay/i.test(lower)) {
      const candidate = values[values.length - 1];
      if (!isHeaderLikeNumber(candidate) && (!Number.isFinite(numericFallback) || candidate >= numericFallback)) {
        return candidate;
      }
    }

    if (/cgst|sgst|igst|vat|tax|service charge|service tax/i.test(lower)) {
      taxTotal += Math.max(...values);
      continue;
    }

    if (/round off/i.test(lower)) {
      roundOff += Math.max(...values);
      continue;
    }

    if (/[a-z]/i.test(line) && values.length >= 2) {
      subtotal += values[values.length - 1];
      rowCount += 1;
    }
  }

  const rowTotal = rowCount >= 3 ? subtotal + taxTotal + roundOff : 0;
  if (rowTotal > 0 && (!Number.isFinite(numericFallback) || rowTotal > numericFallback * 2)) {
    return Number(rowTotal.toFixed(2));
  }

  if (Number.isFinite(numericFallback) && !isHeaderLikeNumber(numericFallback)) {
    return numericFallback;
  }

  return 0;
};

export default function UploadCard() {
  const { theme } = useTheme();
  const fileInput = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [manualEntry, setManualEntry] = useState(false);
  const [fileType, setFileType] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [manualData, setManualData] = useState(emptyManualData);
  const [isDragActive, setIsDragActive] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (!cameraOpen || !cameraStream || !videoRef.current) {
      return;
    }

    videoRef.current.srcObject = cameraStream;
    videoRef.current
      .play()
      .then(() => setCameraReady(true))
      .catch(() => setError("Unable to start the webcam preview."));
  }, [cameraOpen, cameraStream]);

  const resetProcessedReceipt = () => {
    setExtractedData(null);
    setEditableData(null);
    setFileType(null);
  };

  const handleFile = async (file) => {
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "application/pdf",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please upload a receipt image or a PDF invoice.");
      return;
    }

    setLoading(true);
    setSaved(false);
    setError("");
    setManualEntry(false);
    resetProcessedReceipt();
    setFileType(file.type);

    try {
      const result = await processReceiptFile(file);
      const resolvedAmount = inferAmountFromExtractedText(
        result.extracted_text || "",
        result.amount || result.total_amount || 0
      );
      const normalized = {
        amount: resolvedAmount,
        currency: result.currency || "INR",
        category: result.category || "Other",
        date: result.date || getCurrentLocalDate(),
        items: result.items || [],
        extracted_text: result.extracted_text || "",
        ocr_backend: result.ocr_backend || "unknown",
        confidence: result.confidence ?? 0,
        manual_entry_required: Boolean(result.manual_entry_required),
        message: result.message || "",
        file_type: result.file_type || (file.type === "application/pdf" ? "pdf" : "image"),
        filename: result.filename || file.name,
        source: result.source || "ocr",
      };

      setExtractedData(normalized);
      setEditableData({
        amount: normalized.amount || "",
        currency: normalized.currency,
        category: normalized.category,
        date: normalized.date || getCurrentLocalDate(),
        items: normalized.items,
      });

      if (normalized.manual_entry_required) {
        setError(normalized.message || "We couldn't fill everything automatically. Please review the details.");
      }
    } catch (err) {
      setError(err.message || "Failed to process the receipt.");
    } finally {
      setLoading(false);
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setCameraOpen(false);
  };

  const openCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setCameraStream(stream);
      setCameraOpen(true);
      setCameraReady(false);
    } catch (err) {
      setError("Unable to access your webcam. Please allow camera permission and try again.");
    }
  };

  const captureFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Unable to capture the webcam image.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    const capturedFile = await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(new File([blob], `webcam-receipt-${Date.now()}.jpg`, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92
      );
    });

    if (!capturedFile) {
      setError("Unable to create an image from the webcam capture.");
      return;
    }

    closeCamera();
    await handleFile(capturedFile);
  };

  const handleSaveExpense = async () => {
    const activeData = manualEntry ? manualData : editableData;
    if (!activeData) return;

    const amount = Number(activeData.amount);
    const category = String(activeData.category || "").trim();
    const date = String(activeData.date || getCurrentLocalDate()).trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        vendor: "Expense",
        amount,
        currency: activeData.currency || "INR",
        category,
        date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getCurrentLocalDate(),
        items: manualEntry ? activeData.items || [] : activeData.items || [],
      };

      const result = await createExpense(payload);
      setSaved(true);
      window.dispatchEvent(new CustomEvent("expenseAdded", { detail: result.expense }));

      setTimeout(() => {
        setSaved(false);
        setError("");
        if (manualEntry) {
          setManualData(emptyManualData());
        } else {
          resetProcessedReceipt();
        }
      }, 1800);
    } catch (err) {
      setError(err.message || "Failed to save expense.");
    } finally {
      setLoading(false);
    }
  };

  const toggleManualEntry = () => {
    setManualEntry((current) => !current);
    setSaved(false);
    setError("");
    resetProcessedReceipt();
    setManualData(emptyManualData());
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const cardContent = (
    <Motion.div
      className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow sm:p-5 lg:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-blue-800">
            <Sparkles size={16} />
            <span className="text-sm font-semibold">Receipt Import</span>
          </div>
          <span className="text-xs font-medium text-blue-700">{getCurrentLocalDate()}</span>
        </div>
        <p className="mt-1 text-xs text-blue-700">
          Upload a receipt image or PDF to extract the details and save it as an expense.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={toggleManualEntry}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition ${
            manualEntry
              ? "border-orange-200 bg-orange-100 text-orange-700"
              : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          {manualEntry ? <UploadCloud size={16} /> : <Edit3 size={16} />}
          {manualEntry ? "Switch to File Upload" : "Manual Entry"}
        </button>
      </div>

      {manualEntry ? (
        <div className="space-y-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center gap-2 text-orange-700">
            <Plus size={16} />
            <span className="font-semibold">Add Expense Manually</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LabeledInput
              label="Amount"
              type="number"
              value={manualData.amount}
              onChange={(value) => setManualData((current) => ({ ...current, amount: value }))}
              placeholder="0.00"
            />
            <LabeledSelect
              label="Category"
              value={manualData.category}
              onChange={(value) => setManualData((current) => ({ ...current, category: value }))}
              options={defaultCategories}
            />
            <LabeledInput
              label="Date"
              type="date"
              value={manualData.date}
              readOnly
              disabled
            />
          </div>
          <button
            onClick={handleSaveExpense}
            disabled={loading || saved}
            className={`w-full rounded px-4 py-2 text-white transition ${
              saved ? "bg-green-600" : "bg-orange-600 hover:bg-orange-700"
            } ${loading ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {saved ? "Added Successfully" : loading ? "Saving..." : "Add Manual Expense"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition sm:min-h-56 ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
            onDrop={onDrop}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onClick={() => fileInput.current?.click()}
          >
            <div className="mb-3 flex items-center gap-3">
              <Image size={28} className="text-blue-400" />
              <FileText size={28} className="text-red-400" />
            </div>
            <UploadCloud size={32} className="mb-2 text-gray-400" />
            <span className="font-medium text-gray-700">
              {isDragActive ? "Drop your receipt here" : "Upload Invoice or Receipt"}
            </span>
            <span className="text-sm text-gray-500">Supports JPG, PNG, BMP, GIF, and PDF</span>
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={cameraOpen ? closeCamera : openCamera}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
                cameraOpen
                  ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {cameraOpen ? <X size={16} /> : <Camera size={16} />}
              {cameraOpen ? "Close Camera" : "Use Webcam"}
            </button>
          </div>

          {cameraOpen && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="overflow-hidden rounded-lg bg-slate-950">
                <video ref={videoRef} autoPlay playsInline muted className="h-56 w-full object-cover" />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={captureFromCamera}
                  disabled={!cameraReady || loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <Camera size={16} />
                  Capture Receipt
                </button>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 rounded bg-blue-50 p-3 text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Processing {fileType === "application/pdf" ? "PDF" : "receipt image"}...</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded bg-red-50 p-3 text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div className="flex items-start gap-2 rounded border border-green-200 bg-green-50 p-3 text-green-700">
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <span>Expense saved successfully.</span>
        </div>
      )}

      {editableData && !manualEntry && extractedData && (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle size={16} />
              <span className="font-semibold">Receipt processed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LabeledInput
              label="Amount"
              type="number"
              value={editableData.amount}
              onChange={(value) => setEditableData((current) => ({ ...current, amount: value }))}
            />
            <LabeledSelect
              label="Category"
              value={editableData.category}
              onChange={(value) => setEditableData((current) => ({ ...current, category: value }))}
              options={defaultCategories}
            />
            <LabeledInput
              label="Date"
              type="date"
              value={editableData.date}
              readOnly
              disabled
            />
          </div>

          <button
            onClick={handleSaveExpense}
            disabled={loading || saved}
            className={`w-full rounded px-4 py-2 text-white transition ${
              saved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
            } ${loading ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {saved ? "Added Successfully" : loading ? "Saving..." : "Save Expense"}
          </button>
        </div>
      )}
    </Motion.div>
  );

  return theme === "dark" ? <BorderGlow {...darkModeGlowProps}>{cardContent}</BorderGlow> : cardContent;
}

function LabeledInput({ label, onChange, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select category</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
