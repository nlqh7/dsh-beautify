export function chooseOrnaments(state) {
    const selected = ['whaleTail'];
    if (state.selectedNav)
        selected.push('bow');
    if (!state.wide) {
        if (state.dialog)
            selected.push('headbandCorner');
        return selected;
    }
    selected.push(state.composerEngaged ? 'ribbonTab' : 'bubbles');
    if (state.dialog)
        selected.push('apronCrest');
    else if (state.heading)
        selected.push('hairWave');
    if (state.mascot)
        selected.push('cloudTide');
    return selected;
}
//# sourceMappingURL=ornament-policy.js.map