import { ORNAMENT_ART } from "./ornament-art.generated.js";
import { chooseOrnaments } from "./ornament-policy.js";
function isVisible(target, body) {
    if (target.hidden || target.getAttribute('aria-hidden') === 'true')
        return false;
    const checkVisibility = target.checkVisibility;
    if (checkVisibility && !checkVisibility.call(target, { checkOpacity: true, checkVisibilityCSS: true }))
        return false;
    const view = body.ownerDocument.defaultView;
    for (let current = target; current; current = current.parentElement) {
        const style = view?.getComputedStyle(current);
        const opacity = Number.parseFloat(style?.opacity ?? '1');
        if (style?.display === 'none' || style?.visibility === 'hidden' || opacity <= 0.05)
            return false;
        if (current === body)
            break;
    }
    return true;
}
function visibleTarget(body, selector) {
    const target = body.querySelector(selector);
    return target && isVisible(target, body) ? target : null;
}
function workspaceLabelForTree(tree, body) {
    if (!tree)
        return null;
    for (let current = tree; current && current !== body; current = current.parentElement) {
        const header = current.previousElementSibling;
        if (!(header instanceof HTMLElement) || !isVisible(header, body))
            continue;
        const label = Array.from(header.querySelectorAll('span')).find((candidate) => isVisible(candidate, body));
        return label ?? header;
    }
    return null;
}
/** Plain class names; the styles live in the dsh-beautify stylesheet. */
const ornamentClasses = {
    bow: 'dsh-maid-ornament-bow',
    whaleTail: 'dsh-maid-ornament-whale-tail',
    apronCrest: 'dsh-maid-ornament-apron-crest',
    hairWave: 'dsh-maid-ornament-hair-wave',
    bubbles: 'dsh-maid-ornament-bubbles',
    headbandCorner: 'dsh-maid-ornament-headband-corner',
    ribbonTab: 'dsh-maid-ornament-ribbon-tab',
    cloudTide: 'dsh-maid-ornament-cloud-tide',
};
const ORNAMENT_LAYER_CLASS = 'dsh-maid-ornament-layer';
const ORNAMENT_BASE_CLASS = 'dsh-maid-ornament';
function resolveTargets(body) {
    const tree = visibleTarget(body, '[role="tree"]');
    return {
        selectedNav: visibleTarget(body, '[role="treeitem"][aria-selected="true"]'),
        tree,
        workspaceLabel: workspaceLabelForTree(tree, body),
        composer: visibleTarget(body, 'textarea, [contenteditable="true"], input:not([type])'),
        dialog: visibleTarget(body, '[role="dialog"]'),
        heading: visibleTarget(body, 'main h1, main h2, [role="main"] h1, [role="main"] h2'),
        mascot: visibleTarget(body, '[data-skin-chrome="mascot"]'),
    };
}
function hasComposerContent(composer) {
    if (!composer)
        return false;
    if (composer instanceof HTMLInputElement || composer instanceof HTMLTextAreaElement) {
        return composer.value.trim().length > 0;
    }
    return (composer.textContent ?? '').trim().length > 0;
}
function targetFor(id, targets) {
    switch (id) {
        case 'bow': return targets.selectedNav;
        case 'whaleTail': return targets.workspaceLabel ?? targets.tree;
        case 'bubbles':
        case 'ribbonTab': return targets.composer;
        case 'apronCrest':
        case 'headbandCorner': return targets.dialog;
        case 'hairWave': return targets.heading;
        case 'cloudTide': return targets.mascot;
    }
}
export function createOrnamentController(body, options) {
    let wide = options.wide;
    let mode = 'light';
    let disposed = false;
    let frame;
    let targets = resolveTargets(body);
    const layer = body.ownerDocument.createElement('div');
    layer.dataset.skinChrome = 'ornaments';
    layer.className = ORNAMENT_LAYER_CLASS;
    layer.setAttribute('aria-hidden', 'true');
    body.append(layer);
    const resizeObserver = typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => schedule());
    const clearTargetMarkers = () => {
        body.querySelectorAll('[data-dsh-ornament-target]').forEach((target) => {
            target.removeAttribute('data-dsh-ornament-target');
        });
    };
    const sync = () => {
        if (disposed)
            return;
        targets = resolveTargets(body);
        const composerEngaged = targets.composer != null && (targets.composer === body.ownerDocument.activeElement || hasComposerContent(targets.composer));
        const selected = chooseOrnaments({
            wide,
            selectedNav: targets.selectedNav != null,
            dialog: targets.dialog != null,
            composerEngaged,
            heading: targets.heading != null,
            mascot: targets.mascot != null,
        });
        const selectedSet = new Set(selected);
        layer.querySelectorAll('img[data-dsh-ornament]').forEach((image) => {
            if (!selectedSet.has(image.dataset.dshOrnament))
                image.remove();
        });
        clearTargetMarkers();
        resizeObserver?.disconnect();
        for (const id of selected) {
            const target = targetFor(id, targets);
            if (!target)
                continue;
            target.dataset.dshOrnamentTarget = id;
            resizeObserver?.observe(target);
            let image = layer.querySelector(`img[data-dsh-ornament="${id}"]`);
            if (!image) {
                image = body.ownerDocument.createElement('img');
                image.dataset.dshOrnament = id;
                image.className = `${ORNAMENT_BASE_CLASS} ${ornamentClasses[id]}`;
                image.alt = '';
                image.draggable = false;
                image.setAttribute('aria-hidden', 'true');
                layer.append(image);
            }
            image.src = ORNAMENT_ART[mode][id];
            const rect = target.getBoundingClientRect();
            image.style.setProperty('--dsw-x', `${rect.left}px`);
            image.style.setProperty('--dsw-y', `${rect.top}px`);
            image.style.setProperty('--dsw-w', `${rect.width}px`);
            image.style.setProperty('--dsw-h', `${rect.height}px`);
        }
    };
    const requestFrame = (callback) => {
        if (typeof window.requestAnimationFrame === 'function')
            return window.requestAnimationFrame(callback);
        return window.setTimeout(() => callback(performance.now()), 0);
    };
    const cancelFrame = (handle) => {
        if (typeof window.cancelAnimationFrame === 'function')
            window.cancelAnimationFrame(handle);
        else
            window.clearTimeout(handle);
    };
    function schedule() {
        if (disposed || frame != null)
            return;
        frame = requestFrame(() => {
            frame = undefined;
            sync();
        });
    }
    const mutationObserver = new MutationObserver((mutations) => {
        if (mutations.every((mutation) => layer.contains(mutation.target)))
            return;
        schedule();
    });
    mutationObserver.observe(body, {
        attributes: true,
        attributeFilter: ['aria-hidden', 'aria-selected', 'class', 'hidden', 'open', 'role', 'style'],
        childList: true,
        characterData: true,
        subtree: true,
    });
    const eventTypes = ['focusin', 'focusout', 'input', 'transitionend'];
    eventTypes.forEach((type) => body.addEventListener(type, schedule));
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    return {
        sync,
        setMode(nextMode) {
            mode = nextMode;
            sync();
        },
        setWide(nextWide) {
            wide = nextWide;
            sync();
        },
        dispose() {
            if (disposed)
                return;
            disposed = true;
            if (frame != null)
                cancelFrame(frame);
            mutationObserver.disconnect();
            resizeObserver?.disconnect();
            eventTypes.forEach((type) => body.removeEventListener(type, schedule));
            window.removeEventListener('scroll', schedule, true);
            window.removeEventListener('resize', schedule);
            clearTargetMarkers();
            layer.remove();
        },
    };
}
//# sourceMappingURL=ornaments.js.map