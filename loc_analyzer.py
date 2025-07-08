
#!/usr/bin/env python3
"""
Lines of Code Analyzer with Beautiful TUI
A comprehensive tool to analyze code files in any project directory
"""

import os
import sys
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Set
import argparse
from dataclasses import dataclass

# TUI imports
try:
    import curses
    from curses import wrapper
except ImportError:
    print("Error: curses library not available. This tool requires a Unix-like system.")
    sys.exit(1)

@dataclass
class FileStats:
    path: str
    lines: int
    extension: str
    is_code: bool
    language: str

class LocAnalyzer:
    def __init__(self):
        # Comprehensive programming language extensions
        self.code_extensions = {
            # Web Development
            '.html', '.htm', '.xhtml', '.xml', '.svg', '.jsp', '.asp', '.aspx', '.php', '.phtml',
            '.css', '.scss', '.sass', '.less', '.styl', '.stylus',
            '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.vue', '.svelte', '.angular',
            
            # Python
            '.py', '.pyx', '.pyi', '.pyw', '.py3', '.wsgi',
            
            # Java/JVM Languages
            '.java', '.class', '.jar', '.scala', '.kt', '.kts', '.clj', '.cljs', '.cljc', '.groovy',
            
            # C/C++
            '.c', '.cpp', '.cxx', '.cc', '.c++', '.h', '.hpp', '.hxx', '.hh', '.h++', '.inl', '.ipp',
            
            # C#/.NET
            '.cs', '.vb', '.fs', '.fsx', '.fsi', '.ml', '.mli',
            
            # Mobile Development
            '.swift', '.m', '.mm', '.dart', '.kt',
            
            # Systems Programming
            '.rs', '.go', '.zig', '.nim', '.cr', '.d', '.v',
            
            # Functional Languages
            '.hs', '.lhs', '.elm', '.ml', '.mli', '.fs', '.fsx', '.fsi', '.erl', '.hrl', '.ex', '.exs',
            '.clj', '.cljs', '.cljc', '.lisp', '.lsp', '.cl', '.scm', '.ss', '.rkt',
            
            # Scripting Languages
            '.rb', '.rbw', '.rake', '.gemspec', '.pl', '.pm', '.t', '.pod', '.lua', '.tcl', '.tk',
            '.sh', '.bash', '.zsh', '.fish', '.ksh', '.csh', '.ps1', '.psm1', '.psd1', '.bat', '.cmd',
            '.awk', '.sed',
            
            # Data Science/Analytics
            '.r', '.rmd', '.rnw', '.jl', '.m', '.nb', '.wl', '.wls', '.mathematica',
            
            # Database
            '.sql', '.plsql', '.psql', '.mysql', '.sqlite', '.db2', '.proc',
            
            # Assembly
            '.asm', '.s', '.S', '.nasm', '.masm', '.gas',
            
            # Markup/Config (code-like)
            '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.config', '.properties',
            '.json', '.jsonc', '.json5', '.hjson', '.xml', '.plist', '.xaml',
            
            # Build/Make
            '.make', '.makefile', '.mk', '.cmake', '.bazel', '.bzl', '.gradle', '.sbt', '.ant',
            '.nix', '.dockerfile', '.containerfile',
            
            # Version Control
            '.gitignore', '.gitattributes', '.gitmodules', '.hgignore',
            
            # Documentation (code-like)
            '.md', '.markdown', '.mdown', '.mkdn', '.rst', '.adoc', '.asciidoc', '.org',
            '.tex', '.latex', '.ltx', '.cls', '.sty', '.bib',
            
            # Game Development
            '.cs', '.cpp', '.lua', '.gd', '.gdscript', '.as', '.hx', '.hxml',
            
            # Other Languages
            '.pas', '.pp', '.dpr', '.for', '.f', '.f90', '.f95', '.f03', '.f08',
            '.cob', '.cbl', '.cobol', '.ada', '.adb', '.ads', '.mod', '.def',
            '.pro', '.prolog', '.pl', '.curry', '.icl', '.dcl', '.clean',
            '.purs', '.elm', '.reason', '.re', '.rei', '.ocaml', '.ml', '.mli',
            '.hack', '.hh', '.php', '.phpt', '.inc', '.tpl', '.smarty',
        }
        
        # Language mapping
        self.extension_to_language = {
            # Web
            '.html': 'HTML', '.htm': 'HTML', '.xhtml': 'XHTML', '.xml': 'XML', '.svg': 'SVG',
            '.css': 'CSS', '.scss': 'SCSS', '.sass': 'Sass', '.less': 'Less', '.styl': 'Stylus',
            '.js': 'JavaScript', '.jsx': 'JSX', '.ts': 'TypeScript', '.tsx': 'TSX', '.vue': 'Vue',
            '.svelte': 'Svelte', '.mjs': 'JavaScript ES6', '.cjs': 'CommonJS',
            
            # Python
            '.py': 'Python', '.pyx': 'Cython', '.pyi': 'Python Interface', '.pyw': 'Python Windows',
            
            # Java/JVM
            '.java': 'Java', '.scala': 'Scala', '.kt': 'Kotlin', '.kts': 'Kotlin Script',
            '.clj': 'Clojure', '.cljs': 'ClojureScript', '.groovy': 'Groovy',
            
            # C/C++
            '.c': 'C', '.cpp': 'C++', '.cxx': 'C++', '.cc': 'C++', '.c++': 'C++',
            '.h': 'C Header', '.hpp': 'C++ Header', '.hxx': 'C++ Header',
            
            # C#/.NET
            '.cs': 'C#', '.vb': 'Visual Basic', '.fs': 'F#', '.fsx': 'F# Script',
            
            # Mobile
            '.swift': 'Swift', '.m': 'Objective-C', '.mm': 'Objective-C++', '.dart': 'Dart',
            
            # Systems
            '.rs': 'Rust', '.go': 'Go', '.zig': 'Zig', '.nim': 'Nim', '.cr': 'Crystal', '.d': 'D',
            
            # Functional
            '.hs': 'Haskell', '.elm': 'Elm', '.ml': 'OCaml', '.erl': 'Erlang', '.ex': 'Elixir',
            '.lisp': 'Lisp', '.scm': 'Scheme', '.rkt': 'Racket',
            
            # Scripting
            '.rb': 'Ruby', '.pl': 'Perl', '.lua': 'Lua', '.tcl': 'Tcl',
            '.sh': 'Shell', '.bash': 'Bash', '.zsh': 'Zsh', '.fish': 'Fish',
            '.ps1': 'PowerShell', '.bat': 'Batch', '.cmd': 'Command',
            
            # Data Science
            '.r': 'R', '.jl': 'Julia', '.m': 'MATLAB',
            
            # Database
            '.sql': 'SQL', '.plsql': 'PL/SQL',
            
            # Assembly
            '.asm': 'Assembly', '.s': 'Assembly', '.nasm': 'NASM',
            
            # Config/Markup
            '.yaml': 'YAML', '.yml': 'YAML', '.toml': 'TOML', '.json': 'JSON',
            '.xml': 'XML', '.ini': 'INI', '.cfg': 'Config',
            
            # Documentation
            '.md': 'Markdown', '.rst': 'reStructuredText', '.tex': 'LaTeX',
            
            # Other
            '.dockerfile': 'Dockerfile', '.makefile': 'Makefile', '.cmake': 'CMake',
        }
        
        # Directories to exclude
        self.excluded_dirs = {
            'node_modules', 'venv', 'env', '.env', '__pycache__', '.git', '.svn', '.hg',
            'build', 'dist', 'target', 'bin', 'obj', 'out', '.gradle', '.idea', '.vscode',
            '.vs', 'coverage', '.nyc_output', '.pytest_cache', '.tox', '.cache',
            'vendor', 'packages', 'bower_components', 'jspm_packages', 'web_modules',
            '.next', '.nuxt', '.output', '.temp', '.tmp', 'logs', 'log',
            '.DS_Store', 'Thumbs.db', '.Trashes', '.Spotlight-V100', '.fseventsd',
            'venv2', 'venv3', 'virtualenv', '.virtualenv', 'conda-meta',
            '.pytest_cache', '.mypy_cache', '.ruff_cache', '.black_cache',
        }
        
        # File patterns to exclude
        self.excluded_files = {
            'package-lock.json', 'yarn.lock', 'composer.lock', 'Gemfile.lock',
            'Pipfile.lock', 'poetry.lock', '*.min.js', '*.min.css', '*.map',
            '.gitignore', '.gitattributes', '.DS_Store', 'Thumbs.db',
            '*.pyc', '*.pyo', '*.class', '*.o', '*.obj', '*.exe', '*.dll',
            '*.so', '*.dylib', '*.a', '*.lib', '*.jar', '*.war', '*.ear',
        }

    def should_exclude_dir(self, dirname: str) -> bool:
        return dirname.lower() in self.excluded_dirs or dirname.startswith('.')

    def should_exclude_file(self, filename: str) -> bool:
        if filename.startswith('.') and filename not in {'.gitignore', '.gitattributes'}:
            return True
        return any(filename.lower().endswith(pattern.replace('*', '')) 
                  for pattern in self.excluded_files if '*' in pattern) or \
               filename.lower() in self.excluded_files

    def get_language(self, file_path: str) -> Tuple[str, bool]:
        """Get language and whether it's a code file"""
        ext = Path(file_path).suffix.lower()
        if ext in self.code_extensions:
            return self.extension_to_language.get(ext, ext.upper()), True
        return 'Unknown', False

    def count_lines(self, file_path: str) -> int:
        """Count lines in a file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return sum(1 for _ in f)
        except Exception:
            try:
                with open(file_path, 'r', encoding='latin1', errors='ignore') as f:
                    return sum(1 for _ in f)
            except Exception:
                return 0

    def analyze_directory(self, directory: str) -> Tuple[List[FileStats], Dict]:
        """Analyze directory recursively and return file stats and summary"""
        file_stats = []
        summary = {
            'total_files': 0,
            'code_files': 0,
            'unknown_files': 0,
            'total_lines': 0,
            'code_lines': 0,
            'unknown_lines': 0,
            'languages': Counter(),
            'extensions': Counter(),
            'directories_scanned': 0,
        }
        
        # Recursively walk through ALL subdirectories
        for root, dirs, files in os.walk(directory):
            summary['directories_scanned'] += 1
            
            # Filter out excluded directories in-place to prevent traversing them
            dirs[:] = [d for d in dirs if not self.should_exclude_dir(d)]
            
            for file in files:
                if self.should_exclude_file(file):
                    continue
                
                file_path = os.path.join(root, file)
                try:
                    # Skip if file is not readable
                    if not os.access(file_path, os.R_OK):
                        continue
                        
                    lines = self.count_lines(file_path)
                    language, is_code = self.get_language(file_path)
                    ext = Path(file_path).suffix.lower() or 'no extension'
                    
                    stats = FileStats(
                        path=file_path,
                        lines=lines,
                        extension=ext,
                        is_code=is_code,
                        language=language
                    )
                    file_stats.append(stats)
                    
                    # Update summary
                    summary['total_files'] += 1
                    summary['total_lines'] += lines
                    summary['extensions'][ext] += 1
                    
                    if is_code:
                        summary['code_files'] += 1
                        summary['code_lines'] += lines
                        summary['languages'][language] += lines
                    else:
                        summary['unknown_files'] += 1
                        summary['unknown_lines'] += lines
                        
                except Exception as e:
                    # Skip files that can't be processed
                    continue
        
        return file_stats, summary

class LocTUI:
    def __init__(self, analyzer: LocAnalyzer):
        self.analyzer = analyzer
        self.current_dir = os.getcwd()
        self.file_stats = []
        self.summary = {}
        self.current_screen = 'main'
        self.selected_index = 0
        self.scroll_offset = 0
        self.analyzed = False
        
    def init_colors(self):
        curses.start_color()
        curses.init_pair(1, curses.COLOR_GREEN, curses.COLOR_BLACK)   # Headers
        curses.init_pair(2, curses.COLOR_CYAN, curses.COLOR_BLACK)    # Stats
        curses.init_pair(3, curses.COLOR_YELLOW, curses.COLOR_BLACK)  # Highlights
        curses.init_pair(4, curses.COLOR_RED, curses.COLOR_BLACK)     # Errors
        curses.init_pair(5, curses.COLOR_MAGENTA, curses.COLOR_BLACK) # Special
        curses.init_pair(6, curses.COLOR_WHITE, curses.COLOR_BLUE)    # Selected
        
    def draw_header(self, stdscr):
        h, w = stdscr.getmaxyx()
        title = "📊 Lines of Code Analyzer"
        subtitle = f"Directory: {self.current_dir}"
        
        stdscr.attron(curses.color_pair(1) | curses.A_BOLD)
        stdscr.addstr(0, (w - len(title)) // 2, title)
        stdscr.attroff(curses.color_pair(1) | curses.A_BOLD)
        
        stdscr.attron(curses.color_pair(2))
        stdscr.addstr(1, (w - len(subtitle)) // 2, subtitle[:w-2])
        stdscr.attroff(curses.color_pair(2))
        
        # Draw line
        stdscr.addstr(2, 0, "─" * (w-1))

    def draw_menu(self, stdscr, start_y):
        menu_items = [
            "1. Analyze Current Directory",
            "2. Change Directory",
            "3. View Results Summary",
            "4. View Detailed File List",
            "5. View by Language",
            "6. Export Results",
            "Q. Quit"
        ]
        
        stdscr.attron(curses.color_pair(1) | curses.A_BOLD)
        stdscr.addstr(start_y, 2, "Main Menu:")
        stdscr.attroff(curses.color_pair(1) | curses.A_BOLD)
        
        for i, item in enumerate(menu_items):
            y = start_y + 2 + i
            if i == self.selected_index:
                stdscr.attron(curses.color_pair(6) | curses.A_BOLD)
                stdscr.addstr(y, 4, f"► {item}")
                stdscr.attroff(curses.color_pair(6) | curses.A_BOLD)
            else:
                stdscr.addstr(y, 4, f"  {item}")

    def draw_summary(self, stdscr, start_y):
        if not self.analyzed:
            stdscr.attron(curses.color_pair(4))
            stdscr.addstr(start_y, 2, "No analysis performed yet. Select option 1 to analyze.")
            stdscr.attroff(curses.color_pair(4))
            return start_y + 2
            
        h, w = stdscr.getmaxyx()
        
        stdscr.attron(curses.color_pair(1) | curses.A_BOLD)
        stdscr.addstr(start_y, 2, "📈 Analysis Summary:")
        stdscr.attroff(curses.color_pair(1) | curses.A_BOLD)
        
        y = start_y + 2
        
        # Summary stats
        stats = [
            f"Directories Scanned: {self.summary['directories_scanned']:,}",
            f"Total Files: {self.summary['total_files']:,}",
            f"Code Files: {self.summary['code_files']:,}",
            f"Unknown Files: {self.summary['unknown_files']:,}",
            f"Total Lines: {self.summary['total_lines']:,}",
            f"Code Lines: {self.summary['code_lines']:,}",
            f"Unknown Lines: {self.summary['unknown_lines']:,}",
        ]
        
        for stat in stats:
            stdscr.attron(curses.color_pair(2))
            stdscr.addstr(y, 4, stat)
            stdscr.attroff(curses.color_pair(2))
            y += 1
        
        # Top languages
        y += 1
        stdscr.attron(curses.color_pair(3) | curses.A_BOLD)
        stdscr.addstr(y, 4, "Top Languages by Lines of Code:")
        stdscr.attroff(curses.color_pair(3) | curses.A_BOLD)
        y += 1
        
        for lang, lines in self.summary['languages'].most_common(5):
            percentage = (lines / self.summary['code_lines'] * 100) if self.summary['code_lines'] > 0 else 0
            stdscr.attron(curses.color_pair(5))
            stdscr.addstr(y, 6, f"{lang}: {lines:,} lines ({percentage:.1f}%)")
            stdscr.attroff(curses.color_pair(5))
            y += 1
            
        return y + 1

    def draw_file_list(self, stdscr):
        h, w = stdscr.getmaxyx()
        stdscr.clear()
        
        self.draw_header(stdscr)
        
        if not self.analyzed:
            stdscr.attron(curses.color_pair(4))
            stdscr.addstr(4, 2, "No analysis performed yet.")
            stdscr.attroff(curses.color_pair(4))
            stdscr.addstr(h-2, 2, "Press any key to return to main menu...")
            stdscr.refresh()
            stdscr.getch()
            self.current_screen = 'main'
            return
        
        stdscr.attron(curses.color_pair(1) | curses.A_BOLD)
        stdscr.addstr(4, 2, "📁 Detailed File List:")
        stdscr.attroff(curses.color_pair(1) | curses.A_BOLD)
        
        # Headers
        header = f"{'File':<50} {'Lines':<8} {'Language':<15} {'Type'}"
        stdscr.addstr(6, 2, header[:w-4])
        stdscr.addstr(7, 2, "─" * min(len(header), w-4))
        
        # File list with scrolling
        max_display_lines = h - 11
        start_idx = self.scroll_offset
        end_idx = min(start_idx + max_display_lines, len(self.file_stats))
        
        for i in range(start_idx, end_idx):
            file_stat = self.file_stats[i]
            y = 8 + (i - start_idx)
            
            rel_path = os.path.relpath(file_stat.path, self.current_dir)
            if len(rel_path) > 48:
                rel_path = "..." + rel_path[-45:]
                
            line = f"{rel_path:<50} {file_stat.lines:<8} {file_stat.language:<15} {'Code' if file_stat.is_code else 'Other'}"
            
            color = curses.color_pair(2) if file_stat.is_code else curses.color_pair(4)
            stdscr.attron(color)
            stdscr.addstr(y, 2, line[:w-4])
            stdscr.attroff(color)
        
        # Scroll indicators
        if self.scroll_offset > 0:
            stdscr.addstr(8, w-3, "↑")
        if end_idx < len(self.file_stats):
            stdscr.addstr(h-4, w-3, "↓")
        
        # Instructions
        stdscr.addstr(h-3, 2, "↑/↓: Scroll, B: Back to menu")
        
        stdscr.refresh()

    def handle_file_list_input(self, key):
        h, w = curses.initscr().getmaxyx()
        max_display_lines = h - 11
        
        if key == ord('b') or key == ord('B'):
            self.current_screen = 'main'
            self.scroll_offset = 0
        elif key == curses.KEY_UP and self.scroll_offset > 0:
            self.scroll_offset -= 1
        elif key == curses.KEY_DOWN and self.scroll_offset + max_display_lines < len(self.file_stats):
            self.scroll_offset += 1

    def change_directory(self, stdscr):
        h, w = stdscr.getmaxyx()
        stdscr.clear()
        
        stdscr.attron(curses.color_pair(1) | curses.A_BOLD)
        stdscr.addstr(2, 2, "Change Directory")
        stdscr.attroff(curses.color_pair(1) | curses.A_BOLD)
        
        stdscr.addstr(4, 2, f"Current: {self.current_dir}")
        stdscr.addstr(6, 2, "Enter new directory path (or . for current):")
        stdscr.addstr(7, 2, "> ")
        
        stdscr.refresh()
        curses.echo()
        
        try:
            new_dir = stdscr.getstr(7, 4, 100).decode('utf-8').strip()
            if new_dir:
                if new_dir == '.':
                    new_dir = os.getcwd()
                elif not os.path.isabs(new_dir):
                    new_dir = os.path.join(self.current_dir, new_dir)
                
                if os.path.isdir(new_dir):
                    self.current_dir = os.path.abspath(new_dir)
                    self.analyzed = False
                    self.file_stats = []
                    self.summary = {}
                    stdscr.addstr(9, 2, f"✓ Directory changed to: {self.current_dir}")
                else:
                    stdscr.addstr(9, 2, "✗ Directory not found!")
            else:
                stdscr.addstr(9, 2, "No change made.")
        except:
            stdscr.addstr(9, 2, "✗ Invalid input!")
        
        curses.noecho()
        stdscr.addstr(11, 2, "Press any key to continue...")
        stdscr.refresh()
        stdscr.getch()
        self.current_screen = 'main'

    def analyze_directory(self, stdscr):
        h, w = stdscr.getmaxyx()
        stdscr.clear()
        
        stdscr.attron(curses.color_pair(1) | curses.A_BOLD)
        stdscr.addstr(2, 2, "🔍 Analyzing Directory...")
        stdscr.attroff(curses.color_pair(1) | curses.A_BOLD)
        
        stdscr.addstr(4, 2, f"Scanning: {self.current_dir}")
        stdscr.addstr(5, 2, "Please wait...")
        stdscr.refresh()
        
        try:
            self.file_stats, self.summary = self.analyzer.analyze_directory(self.current_dir)
            self.analyzed = True
            
            stdscr.addstr(7, 2, "✓ Analysis complete!")
            stdscr.addstr(8, 2, f"Found {self.summary['total_files']} files with {self.summary['total_lines']:,} total lines")
            stdscr.addstr(9, 2, f"Code files: {self.summary['code_files']} ({self.summary['code_lines']:,} lines)")
        except Exception as e:
            stdscr.addstr(7, 2, f"✗ Error: {str(e)}")
        
        stdscr.addstr(11, 2, "Press any key to continue...")
        stdscr.refresh()
        stdscr.getch()
        self.current_screen = 'main'

    def export_results(self, stdscr):
        if not self.analyzed:
            stdscr.clear()
            stdscr.addstr(2, 2, "No analysis to export. Please analyze a directory first.")
            stdscr.addstr(4, 2, "Press any key to continue...")
            stdscr.refresh()
            stdscr.getch()
            return
        
        try:
            filename = f"loc_analysis_{os.path.basename(self.current_dir)}.txt"
            with open(filename, 'w') as f:
                f.write("Lines of Code Analysis Report\n")
                f.write("=" * 40 + "\n\n")
                f.write(f"Directory: {self.current_dir}\n")
                f.write(f"Analysis Date: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
                f.write("Summary:\n")
                f.write("-" * 20 + "\n")
                f.write(f"Total Files: {self.summary['total_files']:,}\n")
                f.write(f"Code Files: {self.summary['code_files']:,}\n")
                f.write(f"Unknown Files: {self.summary['unknown_files']:,}\n")
                f.write(f"Total Lines: {self.summary['total_lines']:,}\n")
                f.write(f"Code Lines: {self.summary['code_lines']:,}\n")
                f.write(f"Unknown Lines: {self.summary['unknown_lines']:,}\n\n")
                
                f.write("Languages:\n")
                f.write("-" * 20 + "\n")
                for lang, lines in self.summary['languages'].most_common():
                    percentage = (lines / self.summary['code_lines'] * 100) if self.summary['code_lines'] > 0 else 0
                    f.write(f"{lang}: {lines:,} lines ({percentage:.1f}%)\n")
                
                f.write("\nDetailed File List:\n")
                f.write("-" * 20 + "\n")
                for file_stat in sorted(self.file_stats, key=lambda x: x.lines, reverse=True):
                    rel_path = os.path.relpath(file_stat.path, self.current_dir)
                    f.write(f"{rel_path}: {file_stat.lines} lines ({file_stat.language}) {'[Code]' if file_stat.is_code else '[Other]'}\n")
            
            stdscr.clear()
            stdscr.addstr(2, 2, f"✓ Results exported to: {filename}")
            stdscr.addstr(4, 2, "Press any key to continue...")
            stdscr.refresh()
            stdscr.getch()
        except Exception as e:
            stdscr.clear()
            stdscr.addstr(2, 2, f"✗ Export failed: {str(e)}")
            stdscr.addstr(4, 2, "Press any key to continue...")
            stdscr.refresh()
            stdscr.getch()

    def run(self, stdscr):
        try:
            curses.curs_set(0)  # Hide cursor
            self.init_colors()
            stdscr.keypad(True)
            stdscr.timeout(100)  # Add timeout to prevent hanging
            
            while True:
                try:
                    stdscr.clear()
                    h, w = stdscr.getmaxyx()
                    
                    if self.current_screen == 'file_list':
                        self.draw_file_list(stdscr)
                        key = stdscr.getch()
                        if key != -1:  # Only process if key was actually pressed
                            self.handle_file_list_input(key)
                        continue
                    
                    # Main screen
                    self.draw_header(stdscr)
                    
                    menu_start = 4
                    self.draw_menu(stdscr, menu_start)
                    
                    summary_start = menu_start + 10
                    if summary_start < h - 8:
                        self.draw_summary(stdscr, summary_start)
                    
                    # Instructions
                    stdscr.addstr(h-2, 2, "Use ↑/↓ to navigate, Enter to select, Q to quit")
                    
                    stdscr.refresh()
                    
                    key = stdscr.getch()
                    
                    if key == -1:  # Timeout, continue loop
                        continue
                    elif key == ord('q') or key == ord('Q') or key == 27:  # ESC key
                        break
                    elif key == curses.KEY_UP and self.selected_index > 0:
                        self.selected_index -= 1
                    elif key == curses.KEY_DOWN and self.selected_index < 6:
                        self.selected_index += 1
                    elif key == ord('\n') or key == ord(' ') or key == 10 or key == 13:
                        if self.selected_index == 0:  # Analyze
                            self.analyze_directory(stdscr)
                        elif self.selected_index == 1:  # Change directory
                            self.change_directory(stdscr)
                        elif self.selected_index == 2:  # Summary (already shown)
                            pass
                        elif self.selected_index == 3:  # File list
                            self.current_screen = 'file_list'
                        elif self.selected_index == 4:  # By language (same as summary for now)
                            pass
                        elif self.selected_index == 5:  # Export
                            self.export_results(stdscr)
                        elif self.selected_index == 6:  # Quit
                            break
                    elif key >= ord('1') and key <= ord('6'):
                        self.selected_index = key - ord('1')
                        # Auto-execute
                        if self.selected_index == 0:
                            self.analyze_directory(stdscr)
                        elif self.selected_index == 1:
                            self.change_directory(stdscr)
                        elif self.selected_index == 3:
                            self.current_screen = 'file_list'
                        elif self.selected_index == 5:
                            self.export_results(stdscr)
                            
                except curses.error:
                    # Handle terminal resize or other curses errors
                    continue
                    
        except Exception as e:
            # Ensure clean exit on any error
            pass

def main():
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help']:
            print("Lines of Code Analyzer with Beautiful TUI")
            print("Usage: python loc_analyzer.py [directory]")
            print("\nFeatures:")
            print("- Interactive TUI interface")
            print("- Supports 100+ programming languages")
            print("- Excludes common build/dependency folders")
            print("- Export results to text file")
            print("- Real-time analysis")
            return
    
    try:
        analyzer = LocAnalyzer()
        tui = LocTUI(analyzer)
        
        if len(sys.argv) > 1:
            directory = sys.argv[1]
            if os.path.isdir(directory):
                tui.current_dir = os.path.abspath(directory)
        
        wrapper(tui.run)
    except KeyboardInterrupt:
        print("\nAnalysis interrupted by user.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
