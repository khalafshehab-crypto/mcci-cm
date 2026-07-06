import re

def patch_file(filename):
    with open(filename, "r") as f:
        content = f.read()

    # 1. Add handleEndDelegation
    end_del_code = r"""
  const handleEndDelegation = async (delId: string) => {
    if (window.confirm("هل أنت متأكد من إنهاء فترة التكليف؟")) {
      try {
        await updateFirebaseDelegation(delId, { status: "ended", endTimestamp: new Date().toISOString() });
      } catch (e) {
        console.error("Failed to end delegation", e);
      }
    }
  };
"""
    content = content.replace('  const handleTransferDuties = async (e: React.FormEvent) => {', end_del_code + '\n  const handleTransferDuties = async (e: React.FormEvent) => {')

    # 2. Add the UI for delegations
    ui_code = r"""            </form>
            
            {dbDelegations && dbDelegations.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>سجل عمليات النقل والتكليف</span>
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-extrabold text-gray-500">التاريخ</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">النوع</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">المصدر</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">المستهدف</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">التفاصيل</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">الحالة</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dbDelegations.slice().sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((del: any) => (
                        <tr key={del.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600 font-mono" dir="ltr">{new Date(del.timestamp).toLocaleDateString('en-GB')}</td>
                          <td className="px-4 py-3 font-bold text-gray-900">{del.transferMode === "full" ? "نقل دائم" : "تكليف مؤقت"}</td>
                          <td className="px-4 py-3 font-bold text-red-700">{del.sourceEmpName}</td>
                          <td className="px-4 py-3 font-bold text-emerald-700">{del.targetEmpName}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {[
                              del.transferCommittees ? "لجان" : "",
                              del.transferTasks ? "مهام" : "",
                              del.transferEvents ? "فعاليات" : ""
                            ].filter(Boolean).join("، ")}
                          </td>
                          <td className="px-4 py-3">
                            {del.transferMode === "full" ? (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black">مكتمل</span>
                            ) : del.status === "ended" ? (
                              <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[10px] font-black">منتهي</span>
                            ) : (
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black">نشط حتى {del.delegationEndDate}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {del.transferMode === "delegation" && del.status !== "ended" && (
                              <button
                                onClick={() => handleEndDelegation(del.id)}
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[10px] font-black transition-colors"
                              >
                                إنهاء التكليف
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
"""
    content = content.replace('            </form>\n          </div>', ui_code)

    with open(filename, "w") as f:
        f.write(content)

patch_file("src/pages/OrgChart.tsx")
