const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

content = content.replace(
  `                            {/* شريط سفلي نحيف */}
                            <div className="h-1 w-full bg-[#133E87] shrink-0"></div>
                          </div>
                        </div>
                      </div>
                    ) : (`,
  `                            {/* شريط سفلي نحيف */}
                            <div className="h-1 w-full bg-[#133E87] shrink-0"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (`
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
