const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// 1. Table view
const tableTarget = `                          <span className="text-xs text-gray-500 mt-1 block truncate max-w-[150px]" title={m.committeeName}>
                            {m.committeeName}
                          </span>
                        </div>`;
const tableReplace = `                          <span className="text-xs text-gray-500 mt-1 block truncate max-w-[150px]" title={m.committeeName}>
                            {m.committeeName}
                          </span>
                          {m.secondaryCommitteeName && (
                            <span className="text-xs text-gray-500 mt-0.5 block truncate max-w-[150px]" title={m.secondaryCommitteeName}>
                              {m.secondaryCommitteeName}
                            </span>
                          )}
                        </div>`;
code = code.replace(tableTarget, tableReplace);

// 2. Card view
const cardTarget = `                  <p className="text-[11px] font-black text-gray-800 flex items-center gap-1 mt-0.5">
                    <Users2 className="w-3.5 h-3.5 text-brand" />
                    <span>{m.committeeName}</span>
                  </p>
                </div>`;
const cardReplace = `                  <p className="text-[11px] font-black text-gray-800 flex items-center gap-1 mt-0.5">
                    <Users2 className="w-3.5 h-3.5 text-brand" />
                    <span>{m.committeeName}</span>
                  </p>
                  {m.secondaryCommitteeName && (
                    <p className="text-[11px] font-black text-gray-800 flex items-center gap-1 mt-0.5">
                      <Users2 className="w-3.5 h-3.5 text-brand" />
                      <span>{m.secondaryCommitteeName}</span>
                    </p>
                  )}
                </div>`;
code = code.replace(cardTarget, cardReplace);

// 3. Details Modal
const detailsTarget = `                      <p className="text-xs font-black text-gray-900 mt-1 truncate">{detailsMember.committeeName}</p>
                    </div>`;
const detailsReplace = `                      <p className="text-xs font-black text-gray-900 mt-1 truncate">{detailsMember.committeeName}</p>
                      {detailsMember.secondaryCommitteeName && (
                        <p className="text-xs font-black text-gray-900 mt-1 truncate">{detailsMember.secondaryCommitteeName}</p>
                      )}
                    </div>`;
code = code.replace(detailsTarget, detailsReplace);

// 4. Filtering logic
const filterTarget = `        m.committeeName.toLowerCase().includes(term) ||
        (m.entity || "").toLowerCase().includes(term) ||`;
const filterReplace = `        m.committeeName.toLowerCase().includes(term) ||
        (m.secondaryCommitteeName || "").toLowerCase().includes(term) ||
        (m.entity || "").toLowerCase().includes(term) ||`;
code = code.replace(filterTarget, filterReplace);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Views updated");
