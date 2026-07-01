import React from "react";
import { Users } from "lucide-react";

export default function Affiliates() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand/10 text-brand rounded-xl">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">إدارة المنتسبين</h1>
          <p className="text-sm text-gray-500 mt-1">يتم إدارة المنتسبين من هنا</p>
        </div>
      </div>
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl">
        <p className="text-gray-400 font-bold">هذه الصفحة قيد الإنشاء...</p>
      </div>
    </div>
  );
}
