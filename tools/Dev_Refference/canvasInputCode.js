class CanvasMultilineInput {
    constructor(containerElement, canvasElement) {
        this.container = containerElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');

        // --- Configuration ---
        this.font = '16px Arial';
        this.lineHeight = 20;
        this.padding = 10; // Padding inside the canvas
        this.cursorColor = 'black';
        this.cursorWidth = 1;
        this.selectionColor = 'rgba(0, 120, 215, 0.3)'; // Standard selection blue
        this.TAB_REPLACEMENT = '\t'; // Store actual tab, rendering will handle width
        this.cursorBlinkRate = 500; // ms
        this.tabSize = 4; // Number of spaces for a tab character

        // --- State ---
        this.text = ""; // The raw text content
        this.displayLines = [""]; // Text broken into lines for display
        this.cursorPos1D = 0; // Cursor position in the raw 1D text string
        this.cursorPos2D = { line: 0, char: 0 }; // Cursor position in 2D displayLines {line, char_index}
        this.selectionStart1D = 0; // Start of selection in 1D raw text
        this.selectionEnd1D = 0;   // End of selection in 1D raw text
        this.isCursorVisible = true;
        this.cursorInterval = null;
        this.isFocused = false;
        this.isSelecting = false; // True when dragging to select
        this.selectionAnchor1D = 0; // The 1D position where selection started
        this.pointerDownPos = { clientX: 0, clientY: 0 }; // For tap vs drag detection, store client coords
        this.TAP_THRESHOLD = 5; // pixels for tap vs drag

        // --- Scrolling State ---
        this.scrollX = 0;
        this.scrollY = 0;
        this.contentWidth = 0;  // Max width of any line
        this.contentHeight = 0; // Total height of all lines

        // --- Scrollbar Configuration & State ---
        this.scrollbarSize = 10; // Thickness of the scrollbar
        this.minThumbSize = 20;  // Minimum pixel size for a thumb
        this.scrollbarTrackColor = 'rgba(0, 0, 0, 0.1)';
        this.scrollbarThumbColor = 'rgba(0, 0, 0, 0.3)';
        this.isDraggingHorizontalScrollbar = false;
        this.isDraggingVerticalScrollbar = false;
        this.scrollbarDragStart = { pointerX: 0, pointerY: 0, scrollX: 0, scrollY: 0 }; // For drag calculations

        this._setupCanvas();
        this._createHiddenTextarea();
        this._bindEventListeners();
        this._initializeStateAndRender(); // Initial setup
    }

    _setupCanvas() {
        // Match canvas internal size to its display size for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.container.clientWidth * dpr;
        this.canvas.height = this.container.clientHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${this.container.clientWidth}px`;
        this.canvas.style.height = `${this.container.clientHeight}px`;
        // After canvas size changes, scroll might need adjustment if content no longer fits
    }

    _createHiddenTextarea() {
        this.hiddenTextarea = document.createElement('textarea');
        this.hiddenTextarea.className = 'hidden-textarea';
        this.hiddenTextarea.setAttribute('aria-hidden', 'true');
        this.hiddenTextarea.setAttribute('tabindex', '-1'); // Not focusable by tabbing
        this.hiddenTextarea.setAttribute('autocomplete', 'off');
        this.hiddenTextarea.setAttribute('autocorrect', 'off');
        this.hiddenTextarea.setAttribute('autocapitalize', 'off');
        this.hiddenTextarea.setAttribute('spellcheck', 'false');
        this.container.appendChild(this.hiddenTextarea);
    }

    _bindEventListeners() {
        // Store bound versions of handlers for easy removal
        this._boundHandlePointerDown = this._handlePointerDown.bind(this);
        this._boundHandlePointerMove = this._handlePointerMove.bind(this);
        this._boundHandlePointerUp = this._handlePointerUp.bind(this);
        this._boundHandleInput = this._handleInput.bind(this);
        this._boundHandleKeyDown = this._handleKeyDown.bind(this);
        this._boundHandleFocus = this._handleFocus.bind(this);
        this._boundHandleBlur = this._handleBlur.bind(this);
        this._boundHandleResize = () => {
            this._setupCanvas();
            this._refreshCanvas(); // Re-calc layout, ensure cursor visible, clamp scroll
        };

        this.canvas.addEventListener('pointerdown', this._boundHandlePointerDown);
        // Listen on document for move and up to catch drags outside canvas
        document.addEventListener('pointermove', this._boundHandlePointerMove);
        document.addEventListener('pointerup', this._boundHandlePointerUp);

        this.hiddenTextarea.addEventListener('input', this._boundHandleInput);
        this.hiddenTextarea.addEventListener('keydown', this._boundHandleKeyDown);
        this.hiddenTextarea.addEventListener('focus', this._boundHandleFocus);
        this.hiddenTextarea.addEventListener('blur', this._boundHandleBlur);

        // Optional: Re-calculate on window resize
        window.addEventListener('resize', this._boundHandleResize);
    }

    destroy() {
        this._stopCursorBlink();

        this.canvas.removeEventListener('pointerdown', this._boundHandlePointerDown);
        document.removeEventListener('pointermove', this._boundHandlePointerMove);
        document.removeEventListener('pointerup', this._boundHandlePointerUp);

        this.hiddenTextarea.removeEventListener('input', this._boundHandleInput);
        this.hiddenTextarea.removeEventListener('keydown', this._boundHandleKeyDown);
        this.hiddenTextarea.removeEventListener('focus', this._boundHandleFocus);
        this.hiddenTextarea.removeEventListener('blur', this._boundHandleBlur);
        window.removeEventListener('resize', this._boundHandleResize);

        if (this.hiddenTextarea && this.hiddenTextarea.parentNode) {
            this.hiddenTextarea.parentNode.removeChild(this.hiddenTextarea);
        }
        // Nullify references to help GC
        this.container = this.canvas = this.ctx = this.hiddenTextarea = null;
    }

    _getClientXY(event) {
        if (event.touches && event.touches.length > 0) {
            return { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
        }
        return { clientX: event.clientX, clientY: event.clientY };
    }

    _handlePointerDown(event) {
        if (event.target !== this.canvas) return;
        event.preventDefault(); // Prevent text selection on page, allow canvas interaction

        const { clientX, clientY } = this._getClientXY(event);
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;

        const scrollbarMetrics = this._getScrollbarMetrics();

        if (scrollbarMetrics.v.visible && this._isPointerOnScrollbarThumb(canvasX, canvasY, scrollbarMetrics.v.thumb)) {
            this.isDraggingVerticalScrollbar = true;
            this.scrollbarDragStart = { pointerX: clientX, pointerY: clientY, scrollX: this.scrollX, scrollY: this.scrollY };
            // Prevent text selection when grabbing scrollbar
            this.isSelecting = false;
        } else if (scrollbarMetrics.h.visible && this._isPointerOnScrollbarThumb(canvasX, canvasY, scrollbarMetrics.h.thumb)) {
            this.isDraggingHorizontalScrollbar = true;
            this.scrollbarDragStart = { pointerX: clientX, pointerY: clientY, scrollX: this.scrollX, scrollY: this.scrollY };
            // Prevent text selection when grabbing scrollbar
            this.isSelecting = false;
        } else {
            // Click was not on a scrollbar thumb, so it's a text interaction.
            this.isSelecting = true;
            this.pointerDownPos = { clientX, clientY };
            this.selectionAnchor1D = this._find1DPosFor2DPosFromClick(canvasX, canvasY);
            this.cursorPos1D = this.selectionAnchor1D;
            this.selectionStart1D = this.selectionAnchor1D;
            this.selectionEnd1D = this.selectionAnchor1D;
            this._ensureCursorVisible(); // In case click itself requires scroll
        }

        this._focusHiddenTextarea();
        this._syncHiddenTextareaSelection();
        this._render(); // Render after potential scroll adjustment or selection change
    }

    _handlePointerMove(event) {
        const { clientX, clientY } = this._getClientXY(event);

        if (this.isDraggingVerticalScrollbar) {
            const metrics = this._getScrollbarMetrics();
            if (!metrics.v.visible) { this.isDraggingVerticalScrollbar = false; return; }

            const pointerDeltaY = clientY - this.scrollbarDragStart.pointerY;
            const trackPixelRange = metrics.v.track.height - metrics.v.thumb.height;
            const contentScrollableDist = this.contentHeight - metrics.visibleTextHeight;

            if (trackPixelRange > 0 && contentScrollableDist > 0) {
                const scrollDeltaY = (pointerDeltaY / trackPixelRange) * contentScrollableDist;
                this.scrollY = this.scrollbarDragStart.scrollY + scrollDeltaY;
                this._clampScroll();
                this._render();
            }
        } else if (this.isDraggingHorizontalScrollbar) {
            const metrics = this._getScrollbarMetrics();
            if (!metrics.h.visible) { this.isDraggingHorizontalScrollbar = false; return; }

            const pointerDeltaX = clientX - this.scrollbarDragStart.pointerX;
            const trackPixelRange = metrics.h.track.width - metrics.h.thumb.width;
            const contentScrollableDist = this.contentWidth - metrics.visibleTextWidth;

            if (trackPixelRange > 0 && contentScrollableDist > 0) {
                const scrollDeltaX = (pointerDeltaX / trackPixelRange) * contentScrollableDist;
                this.scrollX = this.scrollbarDragStart.scrollX + scrollDeltaX;
                this._clampScroll();
                this._render();
            }
        } else if (this.isSelecting) {
            // Default text selection drag
            const rect = this.canvas.getBoundingClientRect();
            const canvasX = clientX - rect.left;
            const canvasY = clientY - rect.top;

            const current1DPos = this._find1DPosFor2DPosFromClick(canvasX, canvasY);
            this.cursorPos1D = current1DPos; // Cursor follows the drag end
            this.selectionStart1D = Math.min(this.selectionAnchor1D, current1DPos);
            this.selectionEnd1D = Math.max(this.selectionAnchor1D, current1DPos);

            this._syncHiddenTextareaSelection();
            this._ensureCursorVisible(); // Scroll if dragging selection endpoint out of view
            this._render();
        }
    }

    _handlePointerUp(event) {
        if (this.isDraggingVerticalScrollbar || this.isDraggingHorizontalScrollbar) {
            this.isDraggingVerticalScrollbar = false;
            this.isDraggingHorizontalScrollbar = false;
            // Potentially call _ensureCursorVisible if clamping scroll moved cursor out of ideal spot
            // but usually clamping is enough.
            this._render(); // Final render after scroll drag
        } else if (this.isSelecting) {
            this.isSelecting = false;
            const { clientX, clientY } = this._getClientXY(event.changedTouches ? event.changedTouches[0] : event);
            const dx = Math.abs(clientX - this.pointerDownPos.clientX);
            const dy = Math.abs(clientY - this.pointerDownPos.clientY);

            if (dx < this.TAP_THRESHOLD && dy < this.TAP_THRESHOLD) { // Treat as tap
                this.cursorPos1D = this.selectionAnchor1D;
                this.selectionStart1D = this.cursorPos1D;
                this.selectionEnd1D = this.cursorPos1D;
            }
            // For drag, selection is already set by _handlePointerMove

            this._refreshCanvas(); // This will update 2D cursor, sync selection, call _ensureCursorVisible, render
            // Ensure focus remains/is regained for keyboard input
            this._focusHiddenTextarea();
        }
    }

    _focusHiddenTextarea() {
        this.hiddenTextarea.value = this.text; // Sync before focus
        this.hiddenTextarea.focus();
        // Ensure selection is set after focus, as focus can sometimes reset it
        setTimeout(() => {
            if (document.activeElement === this.hiddenTextarea) {
                 try {
                    this._syncHiddenTextareaSelection();
                } catch (e) { /* Silently ignore if not possible */ }
            }
        }, 0);
    }

    _syncHiddenTextareaSelection() {
        if (document.activeElement === this.hiddenTextarea || this.isFocused) { // also sync if we think we are focused
            try {
                this.hiddenTextarea.setSelectionRange(this.selectionStart1D, this.selectionEnd1D);
            } catch (e) { /* Silently ignore */ }
        }
    }

    _updateStateFromTextarea() {
        this.text = this.hiddenTextarea.value;
        this.cursorPos1D = this.hiddenTextarea.selectionStart;
        this.selectionStart1D = this.hiddenTextarea.selectionStart;
        this.selectionEnd1D = this.hiddenTextarea.selectionEnd;
    }

    _updateTextareaFromState(updateValue = true) {
        if (updateValue) {
            this.hiddenTextarea.value = this.text;
        }
        this._syncHiddenTextareaSelection();
    }

    _initializeStateAndRender() {
        this._updateTextareaFromState(); // Sync initial state to textarea
        this._refreshCanvas();
    }

    _handleInput() {
        this._updateStateFromTextarea();
        this._refreshCanvas();
    }

    _handleKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            const start = this.selectionStart1D;
            const end = this.selectionEnd1D;
            this.text = this.text.substring(0, start) + this.TAB_REPLACEMENT + this.text.substring(end);

            this.cursorPos1D = start + this.TAB_REPLACEMENT.length; // TAB_REPLACEMENT is '\t', length 1
            this.selectionStart1D = this.cursorPos1D;
            this.selectionEnd1D = this.cursorPos1D;

            this._updateTextareaFromState(); // Sync new text and selection to textarea
            this._refreshCanvas();           // Update display
            return;
        }

        // Ensure cursor position is updated after keydown (e.g., arrow keys)
        setTimeout(() => {
            if (document.activeElement === this.hiddenTextarea) {
                this.cursorPos1D = this.hiddenTextarea.selectionStart;
                this.selectionStart1D = this.hiddenTextarea.selectionStart;
                this.selectionEnd1D = this.hiddenTextarea.selectionEnd;
                this._refreshCanvas(); // Update display based on new cursor/selection
            }
        }, 0);
    }

    _handleFocus() {
        this.isFocused = true;
        // Sync selection from textarea in case it changed while not focused (e.g. programmatically)
        this.cursorPos1D = this.hiddenTextarea.selectionStart; // Keep cursorPos1D in sync too
        this.selectionStart1D = this.hiddenTextarea.selectionStart;
        this.selectionEnd1D = this.hiddenTextarea.selectionEnd;
        this._startCursorBlink();
        this._render();
    }

    _handleBlur() {
        this.isFocused = false;
        this._stopCursorBlink();
        this.isCursorVisible = false; // Ensure cursor is hidden on blur
        this._render();
    }

    _refreshCanvas() {
        this.displayLines = this._calculateDisplayLinesAndContentSize(this.text);
        this.cursorPos2D = this._map1DTextCursorTo2DDisplayPos(this.text, this.cursorPos1D);

        // Ensure the hidden textarea's selection is synchronized with our internal state.
        this._syncHiddenTextareaSelection();

        this._ensureCursorVisible(); // Adjust scroll based on new cursor/text
        this._render();
    }

    // Helper function to measure text, accounting for custom tab rendering
    _measureTextWithTabs(text) {
        if (!text) return 0;
        let totalWidth = 0;
        this.ctx.font = this.font;
        const spaceWidth = this.ctx.measureText(' ').width;
        const tabWidth = spaceWidth * this.tabSize;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            totalWidth += (char === this.TAB_REPLACEMENT) ? tabWidth : this.ctx.measureText(char).width;
        }
        return totalWidth;
    }


    _wrapTextForDisplay(text) {
        // No actual wrapping, just split by newlines and calculate content dimensions
        // Renamed to _calculateDisplayLinesAndContentSize
        this.displayLines = text.split('\n');
        this.ctx.font = this.font; // Ensure font is set for measurements

        this.contentWidth = 0;
        if (this.displayLines.length === 0) { // Should not happen due to split
            this.displayLines = [""];
        }

        for (let i = 0; i < this.displayLines.length; i++) {
            const lineWidth = this._measureTextWithTabs(this.displayLines[i]);
            if (lineWidth > this.contentWidth) {
                this.contentWidth = lineWidth;
            }
        }

        this.contentHeight = this.displayLines.length * this.lineHeight;
        // Ensure there's at least one line height for the cursor even if text is empty
        if (this.contentHeight === 0 && this.displayLines.length === 1 && this.displayLines[0] === "") {
            this.contentHeight = this.lineHeight;
        }

        return this.displayLines; // Return for consistency, though it modifies 'this.displayLines'
    }

    _calculateDisplayLinesAndContentSize(text) {
        if (text === null || typeof text === 'undefined') text = "";

        this.displayLines = text.split('\n');
        this.ctx.font = this.font; // Ensure font is set for measurements

        this.contentWidth = 0;
        if (this.displayLines.length === 0) { // Should not happen due to split
            this.displayLines = [""];
        }

        for (let i = 0; i < this.displayLines.length; i++) {
            const lineWidth = this._measureTextWithTabs(this.displayLines[i]);
            if (lineWidth > this.contentWidth) {
                this.contentWidth = lineWidth;
            }
        }

        this.contentHeight = this.displayLines.length * this.lineHeight;
        if (this.contentHeight === 0 && this.displayLines.length === 1 && this.displayLines[0] === "") {
            this.contentHeight = this.lineHeight; // Ensure at least one line height for empty input
        }
        return this.displayLines; // Return for potential chaining, though it modifies 'this.displayLines'
    }

    _map1DTextCursorTo2DDisplayPos(rawText, cursorPos1D) {
        const textUpToCursor = rawText.substring(0, cursorPos1D);
        const linesBeforeCursor = textUpToCursor.split('\n');
        const lineIndex = linesBeforeCursor.length - 1;
        const charIndex = linesBeforeCursor[lineIndex].length;
        return { line: lineIndex, char: charIndex };
    }

    _find1DPosFor2DPosFromClick(canvasX, canvasY) {
        // canvasX, canvasY are relative to the canvas element's top-left
        // Convert to coordinates relative to the scrollable content's top-left (0,0)
        const contentClickedX = canvasX - this.padding + this.scrollX;
        const contentClickedY = canvasY - this.padding + this.scrollY;

        const clickedLineIndex = Math.max(0, Math.min(
            this.displayLines.length - 1,
            Math.floor(contentClickedY / this.lineHeight)
        ));

        // Ensure clickedLineIndex is valid for this.displayLines
        if (clickedLineIndex < 0 || clickedLineIndex >= this.displayLines.length) {
             // If clicked outside any valid line (e.g., way below text), place cursor at end of text
            return this.text.length;
        }

        const lineText = this.displayLines[clickedLineIndex];
        let targetCharInDisplayLine = 0;
        // targetXOnLine is the click's X position relative to the start of the clicked line's text
        const targetXOnLine = contentClickedX;
        let minDistance = Infinity;

        this.ctx.font = this.font; // Ensure font is set for measurements
        for (let i = 0; i <= lineText.length; i++) {
            const sub = lineText.substring(0, i);
            const measuredWidth = this._measureTextWithTabs(sub);
            const distance = Math.abs(targetXOnLine - measuredWidth);
            if (distance < minDistance) {
                minDistance = distance;
                targetCharInDisplayLine = i;
            }
        }

        // Convert (clickedLineIndex, targetCharInDisplayLine) to 1D position
        let current1DPos = 0;
        for (let l = 0; l < clickedLineIndex; l++) {
            current1DPos += this.displayLines[l].length + 1; // +1 for the \n character
        }
        current1DPos += targetCharInDisplayLine;

        return Math.min(current1DPos, this.text.length); // Clamp to text length
    }

    _clampScroll() {
        const dpr = window.devicePixelRatio || 1;
        const canvasPhysicalWidth = this.canvas.width / dpr;
        const canvasPhysicalHeight = this.canvas.height / dpr;

        // Calculate the visible area for content inside padding
        const visibleContentWidth = canvasPhysicalWidth - 2 * this.padding;
        const visibleContentHeight = canvasPhysicalHeight - 2 * this.padding;

        const maxScrollX = Math.max(0, this.contentWidth - visibleContentWidth);
        const maxScrollY = Math.max(0, this.contentHeight - visibleContentHeight);

        this.scrollX = Math.max(0, Math.min(this.scrollX, maxScrollX));
        this.scrollY = Math.max(0, Math.min(this.scrollY, maxScrollY));
    }

    _ensureCursorVisible() {
        const dpr = window.devicePixelRatio || 1;
        const canvasPhysicalWidth = this.canvas.width / dpr;
        const canvasPhysicalHeight = this.canvas.height / dpr;
        const visibleContentWidth = canvasPhysicalWidth - 2 * this.padding;
        const visibleContentHeight = canvasPhysicalHeight - 2 * this.padding;

        const { line, char } = this.cursorPos2D;

        // Ensure line and char are valid for current displayLines
        if (line < 0 || line >= this.displayLines.length ||
            char < 0 || char > this.displayLines[line].length) {
            // This case should ideally not be reached if cursorPos2D is always valid.
            // If it is, it might indicate an issue in _map1DTextCursorTo2DDisplayPos or text update logic.
            // For safety, we can try to clamp or simply return.
            this._clampScroll(); // Clamp existing scroll just in case.
            return;
        }

        const lineTextBeforeCursor = this.displayLines[line].substring(0, char);
        const cursorContentX = this._measureTextWithTabs(lineTextBeforeCursor);
        // Estimate cursor width for right edge visibility. Using width of 'M' as a proxy.
        const approxCursorCharWidth = this._measureTextWithTabs("M");

        const cursorContentY = line * this.lineHeight;

        // Horizontal scroll adjustment
        if (cursorContentX < this.scrollX) { // Cursor is to the left of the visible area
            this.scrollX = cursorContentX;
        } else if (cursorContentX + approxCursorCharWidth > this.scrollX + visibleContentWidth) { // Cursor is to the right
            this.scrollX = cursorContentX + approxCursorCharWidth - visibleContentWidth;
        }

        // Vertical scroll adjustment
        if (cursorContentY < this.scrollY) { // Cursor is above the visible area
            this.scrollY = cursorContentY;
        } else if (cursorContentY + this.lineHeight > this.scrollY + visibleContentHeight) { // Cursor is below
            this.scrollY = cursorContentY + this.lineHeight - visibleContentHeight;
        }

        this._clampScroll();
    }

    // Helper function to draw text, accounting for custom tab rendering
    _fillTextWithTabs(text, x, y) {
        if (!text) return;
        let currentX = x;
        this.ctx.font = this.font; // Ensure font is set
        const spaceWidth = this.ctx.measureText(' ').width;
        const tabWidth = spaceWidth * this.tabSize;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === this.TAB_REPLACEMENT) {
                currentX += tabWidth;
            } else {
                this.ctx.fillText(char, currentX, y);
                currentX += this.ctx.measureText(char).width;
            }
        }
    }

    _getScrollbarMetrics() {
        const dpr = window.devicePixelRatio || 1;
        const canvasPhysicalWidth = this.canvas.width / dpr;
        const canvasPhysicalHeight = this.canvas.height / dpr;

        // Visible area for text content (inside padding)
        const visibleTextWidth = canvasPhysicalWidth - 2 * this.padding;
        const visibleTextHeight = canvasPhysicalHeight - 2 * this.padding;

        const metrics = {
            visibleTextWidth,
            visibleTextHeight,
            h: { visible: false, track: {}, thumb: {}, scrollableDist: 0 },
            v: { visible: false, track: {}, thumb: {}, scrollableDist: 0 }
        };

        // Horizontal Scrollbar
        metrics.h.scrollableDist = this.contentWidth - visibleTextWidth;
        if (metrics.h.scrollableDist > 0) {
            metrics.h.visible = true;
            metrics.h.track.x = 0; // Draw at the very edge
            metrics.h.track.y = canvasPhysicalHeight - this.scrollbarSize;
            metrics.h.track.width = canvasPhysicalWidth; // Full width initially
            metrics.h.track.height = this.scrollbarSize;

            const thumbRatioH = visibleTextWidth / this.contentWidth;
            metrics.h.thumb.width = Math.max(this.minThumbSize, metrics.h.track.width * thumbRatioH);
            metrics.h.thumb.height = this.scrollbarSize - 2; // Slightly smaller than track
            metrics.h.thumb.y = metrics.h.track.y + 1;

            const scrollableTrackWidthH = metrics.h.track.width - metrics.h.thumb.width;
            if (metrics.h.scrollableDist > 0 && scrollableTrackWidthH >= 0) {
                metrics.h.thumb.x = (this.scrollX / metrics.h.scrollableDist) * scrollableTrackWidthH;
            } else {
                metrics.h.thumb.x = 0;
            }
        }

        // Vertical Scrollbar
        metrics.v.scrollableDist = this.contentHeight - visibleTextHeight;
        if (metrics.v.scrollableDist > 0) {
            metrics.v.visible = true;
            metrics.v.track.x = canvasPhysicalWidth - this.scrollbarSize;
            metrics.v.track.y = 0; // Draw at the very edge
            metrics.v.track.width = this.scrollbarSize;
            metrics.v.track.height = canvasPhysicalHeight; // Full height initially

            const thumbRatioV = visibleTextHeight / this.contentHeight;
            metrics.v.thumb.height = Math.max(this.minThumbSize, metrics.v.track.height * thumbRatioV);
            metrics.v.thumb.width = this.scrollbarSize - 2; // Slightly smaller than track
            metrics.v.thumb.x = metrics.v.track.x + 1;

            const scrollableTrackHeightV = metrics.v.track.height - metrics.v.thumb.height;
            if (metrics.v.scrollableDist > 0 && scrollableTrackHeightV >= 0) {
                metrics.v.thumb.y = (this.scrollY / metrics.v.scrollableDist) * scrollableTrackHeightV;
            } else {
                metrics.v.thumb.y = 0;
            }

            // Adjust track dimensions if both scrollbars are visible (to avoid overlap)
            if (metrics.h.visible) {
                metrics.v.track.height -= this.scrollbarSize; // Shorten V track
                // Re-calculate V thumb based on new track height
                metrics.v.thumb.height = Math.max(this.minThumbSize, metrics.v.track.height * thumbRatioV); // Use V's thumbRatioV
                const newScrollableTrackHeightV = metrics.v.track.height - metrics.v.thumb.height;
                if (metrics.v.scrollableDist > 0 && newScrollableTrackHeightV >= 0) {
                    metrics.v.thumb.y = (this.scrollY / metrics.v.scrollableDist) * newScrollableTrackHeightV;
                } else {
                    metrics.v.thumb.y = 0;
                }

                metrics.h.track.width -= this.scrollbarSize; // Shorten H track
                // Re-calculate H thumb based on new track width
                const currentThumbRatioH = visibleTextWidth / this.contentWidth; // Explicitly use H's ratio
                metrics.h.thumb.width = Math.max(this.minThumbSize, metrics.h.track.width * currentThumbRatioH);

                const newScrollableTrackWidthH = metrics.h.track.width - metrics.h.thumb.width;
                if (metrics.h.scrollableDist > 0 && newScrollableTrackWidthH >= 0) {
                    metrics.h.thumb.x = (this.scrollX / metrics.h.scrollableDist) * newScrollableTrackWidthH;
                } else {
                    metrics.h.thumb.x = 0;
                }
            }
        }
        return metrics;
    }

    _isPointerOnScrollbarThumb(canvasX, canvasY, thumbRect) {
        return canvasX >= thumbRect.x && canvasX <= thumbRect.x + thumbRect.width &&
               canvasY >= thumbRect.y && canvasY <= thumbRect.y + thumbRect.height;
    }

    _render() {
        const dpr = window.devicePixelRatio || 1;
        const physicalCanvasWidth = this.canvas.width / dpr;
        const physicalCanvasHeight = this.canvas.height / dpr;

        // Clear entire canvas
        this.ctx.clearRect(0, 0, physicalCanvasWidth, physicalCanvasHeight);

        // Background (optional, if different from container)
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, physicalCanvasWidth, physicalCanvasHeight);

        this.ctx.save();

        // Set up clipping region for the content area (inside padding)
        const clipX = this.padding;
        const clipY = this.padding;
        const clipWidth = physicalCanvasWidth - 2 * this.padding;
        const clipHeight = physicalCanvasHeight - 2 * this.padding;
        this.ctx.beginPath();
        this.ctx.rect(clipX, clipY, clipWidth, clipHeight);
        this.ctx.clip();

        this.ctx.translate(this.padding - this.scrollX, this.padding - this.scrollY);

        // Draw text
        this.ctx.font = this.font;
        this.ctx.fillStyle = 'black';
        this.ctx.textBaseline = 'top'; // Important for y-positioning

        for (let i = 0; i < this.displayLines.length; i++) {
            const lineText = this.displayLines[i];
            const x = 0; // Relative to translated origin
            const y = i * this.lineHeight; // Relative to translated origin
            this._fillTextWithTabs(lineText, x, y);
        }

        // Draw selection highlight
        if (this.selectionStart1D !== this.selectionEnd1D && this.isFocused) {
            const selStart1D = Math.min(this.selectionStart1D, this.selectionEnd1D);
            const selEnd1D = Math.max(this.selectionStart1D, this.selectionEnd1D);

            const start2D = this._map1DTextCursorTo2DDisplayPos(this.text, selStart1D);
            const end2D = this._map1DTextCursorTo2DDisplayPos(this.text, selEnd1D);

            this.ctx.fillStyle = this.selectionColor;
            this.ctx.font = this.font; // Ensure font is set for measurements

            for (let i = start2D.line; i <= end2D.line; i++) {
                if (i < 0 || i >= this.displayLines.length) continue;

                const currentLineText = this.displayLines[i];
                const y = i * this.lineHeight; // Relative to translated origin
                let xHighlightStart = 0; // Relative to line start
                let xHighlightEnd = this._measureTextWithTabs(currentLineText);

                if (i === start2D.line) {
                    const textBeforeSelection = currentLineText.substring(0, start2D.char);
                    xHighlightStart = this._measureTextWithTabs(textBeforeSelection);
                }
                if (i === end2D.line) {
                    const textUpToSelectionEnd = currentLineText.substring(0, end2D.char);
                    xHighlightEnd = this._measureTextWithTabs(textUpToSelectionEnd);
                }
                
                if (xHighlightEnd > xHighlightStart) { // Ensure there's something to highlight
                    this.ctx.fillRect(xHighlightStart, y, xHighlightEnd - xHighlightStart, this.lineHeight);
                }
            }
        }

        // Draw cursor
        if (this.isFocused && this.isCursorVisible && this.selectionStart1D === this.selectionEnd1D) { // Only show cursor if no selection
            const { line, char } = this.cursorPos2D;
            if (line >= 0 && line < this.displayLines.length) {
                const lineTextContent = this.displayLines[line];
                const textBeforeCursor = lineTextContent.substring(0, char);
                const cursorX = this._measureTextWithTabs(textBeforeCursor); // Relative to line start
                const cursorY = line * this.lineHeight; // Relative to translated origin
                
                this.ctx.beginPath();
                this.ctx.moveTo(cursorX, cursorY);
                this.ctx.lineTo(cursorX, cursorY + this.lineHeight);
                this.ctx.strokeStyle = this.cursorColor;
                this.ctx.lineWidth = this.cursorWidth;
                this.ctx.stroke();
            }
        }

        this.ctx.restore(); // Restore clipping and translation

        // --- Draw Scrollbars ---
        const scrollbarMetrics = this._getScrollbarMetrics();

        // Vertical Scrollbar
        if (scrollbarMetrics.v.visible) {
            this.ctx.fillStyle = this.scrollbarTrackColor;
            this.ctx.fillRect(scrollbarMetrics.v.track.x, scrollbarMetrics.v.track.y, scrollbarMetrics.v.track.width, scrollbarMetrics.v.track.height);
            this.ctx.fillStyle = this.scrollbarThumbColor;
            this.ctx.fillRect(scrollbarMetrics.v.thumb.x, scrollbarMetrics.v.thumb.y, scrollbarMetrics.v.thumb.width, scrollbarMetrics.v.thumb.height);
        }

        // Horizontal Scrollbar
        if (scrollbarMetrics.h.visible) {
            this.ctx.fillStyle = this.scrollbarTrackColor;
            this.ctx.fillRect(scrollbarMetrics.h.track.x, scrollbarMetrics.h.track.y, scrollbarMetrics.h.track.width, scrollbarMetrics.h.track.height);
            this.ctx.fillStyle = this.scrollbarThumbColor;
            this.ctx.fillRect(scrollbarMetrics.h.thumb.x, scrollbarMetrics.h.thumb.y, scrollbarMetrics.h.thumb.width, scrollbarMetrics.h.thumb.height);
        }
    }

    _startCursorBlink() {
        if (this.cursorInterval) clearInterval(this.cursorInterval);
        this.isCursorVisible = true; // Start visible
        this.cursorInterval = setInterval(() => {
            this.isCursorVisible = !this.isCursorVisible;
            this._render();
        }, this.cursorBlinkRate);
        this._render(); // Initial render with cursor potentially visible
    }

    _stopCursorBlink() {
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
            this.cursorInterval = null;
        }
    }

    // Public method to set text if needed
    setText(newText) {
        this.text = newText;
        this.cursorPos1D = newText.length; // Place cursor at the end
        this.selectionStart1D = this.cursorPos1D;
        this.selectionEnd1D = this.cursorPos1D;
        this.hiddenTextarea.value = this.text;
        this._updateTextareaFromState(); // Syncs text and selection to textarea
        this._refreshCanvas();           // Update display based on new text
    }

    // Public method to get text
    getText() {
        return this.text;
    }
}
