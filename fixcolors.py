import os, re

def fix(dir_path):
    changed = 0
    for root, _, files in os.walk(dir_path):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts') or f.endswith('.css'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                og = content
                
                # Colors
                content = re.sub(r'text-indigo-[4567]00', 'text-brand-primary', content)
                content = re.sub(r'bg-indigo-[56]00', 'bg-brand-primary', content)
                content = re.sub(r'bg-indigo-[34]00', 'bg-brand-primary-light', content)
                content = re.sub(r'bg-indigo-700', 'bg-brand-primary/90', content)
                content = re.sub(r'border-indigo-[4567]00', 'border-brand-primary', content)
                content = re.sub(r'ring-indigo-[4567]00', 'ring-brand-primary', content)
                content = re.sub(r'focus:ring-indigo-[4567]00', 'focus:ring-brand-primary', content)
                content = re.sub(r'focus:border-indigo-[4567]00', 'focus:border-brand-primary', content)
                content = re.sub(r'hover:bg-indigo-[567]00', 'hover:bg-brand-primary/90', content)
                content = re.sub(r'hover:text-indigo-[567]00', 'hover:text-brand-primary', content)
                content = re.sub(r'hover:border-indigo-[567]00', 'hover:border-brand-primary', content)
                content = re.sub(r'accent-indigo-[567]00', 'accent-brand-primary', content)
                
                content = re.sub(r'text-blue-[4567]00', 'text-brand-secondary', content)
                content = re.sub(r'bg-blue-[567]00', 'bg-brand-secondary', content)
                content = re.sub(r'border-blue-[4567]00', 'border-brand-secondary', content)
                content = re.sub(r'hover:bg-blue-[567]00', 'hover:bg-brand-secondary/90', content)
                content = re.sub(r'hover:text-blue-[567]00', 'hover:text-brand-secondary', content)
                
                content = re.sub(r'bg-indigo-50(?!0)', 'bg-brand-primary/5', content)
                content = re.sub(r'bg-indigo-100', 'bg-brand-primary/10', content)
                content = re.sub(r'dark:text-indigo-[34]00', 'dark:text-brand-primary-light', content)
                content = re.sub(r'dark:bg-indigo-[89]00', 'dark:bg-brand-primary/10', content)
                content = re.sub(r'dark:bg-indigo-[89]50', 'dark:bg-brand-primary/10', content)
                content = re.sub(r'dark:border-indigo-[456]00', 'dark:border-brand-primary/30', content)
                content = re.sub(r'dark:hover:bg-indigo-[89]00', 'dark:hover:bg-brand-primary/20', content)
                content = re.sub(r'dark:hover:bg-indigo-[89]50', 'dark:hover:bg-brand-primary/20', content)
                content = re.sub(r'fill-indigo-[4567]00', 'fill-brand-primary', content)
                content = re.sub(r'shadow-indigo-[4567]00/20', 'shadow-brand-primary/20', content)
                content = re.sub(r'ring-indigo-[4567]00/10', 'ring-brand-primary/10', content)
                content = re.sub(r'ring-indigo-[4567]00/20', 'ring-brand-primary/20', content)
                content = re.sub(r'ring-indigo-[4567]00/30', 'ring-brand-primary/30', content)
                
                if content != og:
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(content)
                    changed += 1
                    print('Fixed: ' + path)
    return changed

print('Fixed ' + str(fix('app') + fix('components')) + ' files.')
