with open('src/pages/OrgChart.tsx', 'r') as f:
    content = f.read()

target = """          <span>تنظيم التصميم</span>
        </button>
          </div>
        )}
      </div>
      {/* 3. PRESENTATION OF ACTIVE VIEWPORT */}"""

replacement = """          <span>تنظيم التصميم</span>
        </button>
          </>
        )}
      </div>
      {/* 3. PRESENTATION OF ACTIVE VIEWPORT */}"""

content = content.replace(target, replacement)

with open('src/pages/OrgChart.tsx', 'w') as f:
    f.write(content)
