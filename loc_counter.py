import os
from pathlib import Path

from textual.app import App, ComposeResult
from textual.containers import Container, VerticalScroll
from textual.widgets import DirectoryTree, Header, Footer, Static


class LOCApp(App):
    """A Textual app to count lines of code in a directory."""

    CSS_PATH = "loc_counter.css"
    BINDINGS = [("d", "toggle_dark", "Toggle dark mode")]

    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        path = "."
        yield Header()
        yield Container(
            DirectoryTree(path, id="tree-view"),
            VerticalScroll(Static(id="results"), id="results-view"),
        )
        yield Footer()

    def on_mount(self) -> None:
        """Set the focus to the directory tree."""
        self.query_one(DirectoryTree).focus()

    def on_directory_tree_directory_selected(
        self, event: DirectoryTree.DirectorySelected
    ) -> None:
        """Called when the user selects a directory in the DirectoryTree."""
        results_view = self.query_one("#results", Static)
        path = event.path
        line_count = 0
        file_count = 0
        try:
            for root, _, files in os.walk(path):
                for file in files:
                    try:
                        file_path = Path(root) / file
                        if not os.path.islink(file_path):
                            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                                line_count += len(f.readlines())
                            file_count += 1
                    except Exception:
                        pass  # Ignore files that can't be opened
            results_view.update(f"Selected Directory: {path}\n\nFiles found: {file_count}\nTotal lines: {line_count}")
        except Exception as e:
            results_view.update(f"Error: {e}")

    def action_toggle_dark(self) -> None:
        """An action to toggle dark mode."""
        self.dark = not self.dark


if __name__ == "__main__":
    app = LOCApp()
    app.run()
