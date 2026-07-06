/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { Users } from "lucide-react";
import { motion } from "motion/react";

export default function Affiliates() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-brand" />
            إدارة المنتسبين
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-bold">
            بانتظار توجيهاتكم لإضافة المحتوى الخاص بهذه الإدارة...
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
      >
        <div className="text-gray-400 mb-4 flex justify-center">
          <Users className="w-16 h-16 opacity-20" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">مساحة عمل جديدة</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          تم إنشاء هذه الصفحة المستقلة لتكون خاصة بإدارة المنتسبين. يمكنك الآن تزويدي بالمتطلبات والميزات والشاشات التي تريد إضافتها هنا.
        </p>
      </motion.div>
    </div>
  );
}
