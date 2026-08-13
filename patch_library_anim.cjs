const fs = require('fs');
const file = 'src/pages/Library.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `              </form>
            </motion.div>
          </div>
        )}`,
  `              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>`
);

fs.writeFileSync(file, content);
console.log('Patched');
