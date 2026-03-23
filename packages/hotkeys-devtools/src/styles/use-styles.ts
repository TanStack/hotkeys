import * as goober from 'goober'
import { createEffect, createSignal } from 'solid-js'
import { useTheme } from '@tanstack/devtools-ui'
import { tokens } from './tokens'

const stylesFactory = (theme: 'light' | 'dark') => {
  const { colors, font, size, alpha, border } = tokens
  const { fontFamily, size: fontSize } = font
  const css = goober.css
  const t = (light: string, dark: string) => (theme === 'light' ? light : dark)

  return {
    /** Full-height flex child so MainPanel gets a bounded height from the portal */
    shellRoot: css`
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: 100%;
      flex: 1;
      overflow: hidden;
    `,
    /** Overrides devtools-ui MainPanel (overflow-y: auto) so inner columns scroll independently */
    mainPanelShell: css`
      display: flex;
      flex-direction: column;
      flex: 1 1 0%;
      min-height: 0;
      height: auto;
      overflow: hidden !important;
    `,
    mainContainer: css`
      display: flex;
      flex-direction: column;
      flex: 1 1 0%;
      min-height: 0;
      overflow: hidden;
      padding: ${size[2]};
      padding-top: 0;
      margin-top: ${size[2]};
    `,
    heldKeysBar: css`
      background: ${t(colors.gray[100], colors.darkGray[800])};
      border-radius: ${border.radius.lg};
      border: 1px solid ${t(colors.gray[200], colors.darkGray[700])};
      display: flex;
      align-items: center;
      gap: ${size[3]};
      padding: ${size[3]} ${size[3]};
      flex-shrink: 0;
      min-height: 64px;
      margin-bottom: ${size[2]};
    `,
    heldKeysBarHeader: css`
      font-size: ${fontSize.sm};
      font-weight: ${font.weight.bold};
      color: ${t(colors.gray[600], colors.gray[400])};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    `,
    heldKeysBarList: css`
      display: flex;
      align-items: center;
      gap: ${size[1.5]};
      flex-wrap: wrap;
      flex: 1;
      min-width: 0;
    `,
    panelsContainer: css`
      display: flex;
      flex: 1 1 0%;
      min-height: 0;
      overflow: hidden;
      align-items: stretch;
    `,
    dragHandle: css`
      width: 8px;
      background: ${t(colors.gray[300], colors.darkGray[600])};
      cursor: col-resize;
      position: relative;
      transition: all 0.2s ease;
      user-select: none;
      pointer-events: all;
      margin: 0 ${size[1]};
      border-radius: 2px;

      &:hover {
        background: ${t(colors.blue[600], colors.blue[500])};
        margin: 0 ${size[1]};
      }

      &.dragging {
        background: ${t(colors.blue[700], colors.blue[600])};
        margin: 0 ${size[1]};
      }

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 2px;
        height: 20px;
        background: ${t(colors.gray[400], colors.darkGray[400])};
        border-radius: 1px;
        pointer-events: none;
      }

      &:hover::after,
      &.dragging::after {
        background: ${t(colors.blue[500], colors.blue[300])};
      }
    `,
    keyCap: css`
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      padding: ${size[1]} ${size[2]};
      font-family: ${fontFamily.mono};
      font-size: ${fontSize.sm};
      font-weight: ${font.weight.bold};
      color: ${t(colors.gray[800], colors.gray[100])};
      background: ${t(colors.white, colors.darkGray[600])};
      border: 1px solid ${t(colors.gray[300], colors.darkGray[400])};
      border-bottom-width: 2px;
      border-radius: ${border.radius.sm};
      box-shadow: ${tokens.shadow.xs()};
      text-transform: capitalize;
      white-space: nowrap;
      line-height: 1.2;
    `,
    keyCapCode: css`
      font-size: ${fontSize['2xs']};
      font-weight: ${font.weight.normal};
      color: ${t(colors.gray[500], colors.gray[400])};
      text-transform: none;
      line-height: 1;
      margin-top: 2px;
    `,
    noKeysHeld: css`
      font-size: ${fontSize.sm};
      color: ${t(colors.gray[400], colors.gray[600])};
      font-style: italic;
      text-align: center;
      padding: ${size[1]};
    `,
    leftPanel: css`
      background: ${t(colors.gray[100], colors.darkGray[800])};
      border-radius: ${border.radius.lg};
      border: 1px solid ${t(colors.gray[200], colors.darkGray[700])};
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      min-height: 0;
      min-width: 0;
    `,
    leftPanelScroll: css`
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    `,
    rightPanel: css`
      background: ${t(colors.gray[100], colors.darkGray[800])};
      border-radius: ${border.radius.lg};
      border: 1px solid ${t(colors.gray[200], colors.darkGray[700])};
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    `,
    panelHeader: css`
      font-size: ${fontSize.md};
      font-weight: ${font.weight.bold};
      color: ${t(colors.blue[700], colors.blue[400])};
      padding: ${size[2]};
      border-bottom: 1px solid ${t(colors.gray[200], colors.darkGray[700])};
      background: ${t(colors.gray[100], colors.darkGray[800])};
      flex-shrink: 0;
    `,
    hotkeyList: css`
      padding: ${size[1]};
    `,
    hotkeyRow: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${size[2]};
      margin-bottom: ${size[1]};
      background: ${t(colors.gray[200], colors.darkGray[700])};
      border-radius: ${border.radius.md};
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;

      &:hover {
        background: ${t(colors.gray[300], colors.darkGray[600])};
        border-color: ${t(colors.gray[400], colors.darkGray[500])};
      }
    `,
    hotkeyRowSelected: css`
      background: ${t(colors.blue[100], colors.blue[900] + alpha[20])};
      border-color: ${t(colors.blue[600], colors.blue[500])};
      box-shadow: 0 0 0 1px
        ${t(colors.blue[600] + alpha[30], colors.blue[500] + alpha[30])};
    `,
    hotkeyRowTriggered: css`
      animation: hotkey-pulse 0.6s ease-out;

      @keyframes hotkey-pulse {
        0% {
          border-color: ${t(colors.blue[500], colors.blue[400])};
          box-shadow: 0 0 0 2px
            ${t(colors.blue[500] + alpha[40], colors.blue[400] + alpha[40])};
        }
        100% {
          border-color: transparent;
          box-shadow: 0 0 0 0px
            ${t(colors.blue[500] + '00', colors.blue[400] + '00')};
        }
      }
    `,
    hotkeyLabel: css`
      font-family: ${fontFamily.mono};
      font-size: ${fontSize.xs};
      color: ${t(colors.gray[900], colors.gray[100])};
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,
    sequenceStepMatched: css`
      font-weight: ${font.weight.bold};
      color: ${t(colors.blue[700], colors.blue[300])};
    `,
    hotkeyBadges: css`
      display: flex;
      gap: ${size[1]};
      margin-left: ${size[1]};
      flex-shrink: 0;
      overflow: visible;
    `,
    badge: css`
      font-size: ${fontSize['2xs']};
      padding: ${size[0.5]} ${size[1]};
      border-radius: ${border.radius.sm};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    `,
    badgeEnabled: css`
      color: ${t(colors.green[700], colors.green[400])};
      background: ${t(colors.green[100], colors.green[900] + alpha[30])};
    `,
    badgeDisabled: css`
      color: ${t(colors.red[700], colors.red[400])};
      background: ${t(colors.red[100], colors.red[900] + alpha[30])};
    `,
    badgeKeydown: css`
      color: ${t(colors.purple[700], colors.purple[400])};
      background: ${t(colors.purple[100], colors.purple[900] + alpha[30])};
    `,
    badgeKeyup: css`
      color: ${t(colors.teal[700], colors.teal[400])};
      background: ${t(colors.teal[100], colors.teal[900] + alpha[30])};
    `,
    badgeTarget: css`
      color: ${t(colors.gray[700], colors.gray[300])};
      background: ${t(colors.gray[200], colors.darkGray[600])};
    `,
    badgeConflict: css`
      color: ${t(colors.yellow[700], colors.yellow[400])};
      background: ${t(colors.yellow[100], colors.yellow[900] + alpha[30])};
    `,
    badgeError: css`
      color: ${t(colors.red[700], colors.red[400])};
      background: ${t(colors.red[100], colors.red[900] + alpha[30])};
    `,
    badgeAllow: css`
      color: ${t(colors.gray[600], colors.gray[400])};
      background: ${t(colors.gray[200], colors.darkGray[600])};
    `,
    badgeInfo: css`
      color: ${t(colors.blue[700], colors.blue[400])};
      background: ${t(colors.blue[100], colors.blue[900] + alpha[30])};
    `,
    stateDetails: css`
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: ${size[2]};
    `,
    stateHeader: css`
      margin-bottom: ${size[2]};
      padding-bottom: ${size[2]};
      border-bottom: 1px solid ${t(colors.gray[200], colors.darkGray[700])};
    `,
    stateTitle: css`
      font-size: ${fontSize.md};
      font-weight: ${font.weight.bold};
      color: ${t(colors.blue[700], colors.blue[400])};
      margin-bottom: ${size[1]};
    `,
    detailsGrid: css`
      display: grid;
      grid-template-columns: 1fr;
      gap: ${size[2]};
      align-items: start;
    `,
    detailSection: css`
      background: ${t(colors.white, colors.darkGray[700])};
      border: 1px solid ${t(colors.gray[300], colors.darkGray[600])};
      border-radius: ${border.radius.md};
      padding: ${size[2]};
    `,
    detailSectionHeader: css`
      font-size: ${fontSize.sm};
      font-weight: ${font.weight.bold};
      color: ${t(colors.gray[800], colors.gray[200])};
      margin-bottom: ${size[1]};
      text-transform: uppercase;
      letter-spacing: 0.04em;
    `,
    infoGrid: css`
      display: grid;
      grid-template-columns: auto 1fr;
      gap: ${size[1]};
      row-gap: ${size[1]};
      align-items: center;
    `,
    infoLabel: css`
      color: ${t(colors.gray[600], colors.gray[400])};
      font-size: ${fontSize.xs};
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `,
    infoValueMono: css`
      font-family: ${fontFamily.mono};
      font-size: ${fontSize.xs};
      color: ${t(colors.gray[900], colors.gray[100])};
      word-break: break-all;
    `,
    actionsRow: css`
      display: flex;
      flex-wrap: wrap;
      gap: ${size[2]};
    `,
    actionButton: css`
      display: inline-flex;
      align-items: center;
      gap: ${size[1]};
      padding: ${size[1]} ${size[2]};
      border-radius: ${border.radius.md};
      border: 1px solid ${t(colors.gray[300], colors.darkGray[500])};
      background: ${t(colors.gray[200], colors.darkGray[600])};
      color: ${t(colors.gray[900], colors.gray[100])};
      font-size: ${fontSize.xs};
      cursor: pointer;
      user-select: none;
      transition:
        background 0.15s,
        border-color 0.15s;
      &:hover {
        background: ${t(colors.gray[300], colors.darkGray[500])};
        border-color: ${t(colors.gray[400], colors.darkGray[400])};
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
          background: ${t(colors.gray[200], colors.darkGray[600])};
          border-color: ${t(colors.gray[300], colors.darkGray[500])};
        }
      }
    `,
    actionDotGreen: css`
      width: 6px;
      height: 6px;
      border-radius: 9999px;
      background: ${colors.green[400]};
    `,
    noSelection: css`
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${t(colors.gray[500], colors.gray[500])};
      font-style: italic;
      text-align: center;
      padding: ${size[4]};
    `,
    keyBreakdown: css`
      display: flex;
      flex-wrap: wrap;
      gap: ${size[1]};
      align-items: center;
    `,
    keyBreakdownPlus: css`
      color: ${t(colors.gray[500], colors.gray[400])};
      font-size: ${fontSize.sm};
    `,
    keyCapLarge: css`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      padding: ${size[1]} ${size[2]};
      font-family: ${fontFamily.mono};
      font-size: ${fontSize.sm};
      font-weight: ${font.weight.bold};
      color: ${t(colors.gray[800], colors.gray[100])};
      background: ${t(colors.white, colors.darkGray[600])};
      border: 1px solid ${t(colors.gray[300], colors.darkGray[400])};
      border-bottom-width: 3px;
      border-radius: ${border.radius.md};
      box-shadow: ${tokens.shadow.sm()};
      text-transform: capitalize;
      white-space: nowrap;
    `,
    keyCapLargeInProgress: css`
      border-color: ${t(colors.blue[500], colors.blue[400])};
      color: ${t(colors.blue[900], colors.blue[200])};
      background: ${t(colors.blue[50], colors.darkGray[500])};
    `,
    conflictList: css`
      display: flex;
      flex-direction: column;
      gap: ${size[1]};
    `,
    conflictItem: css`
      font-family: ${fontFamily.mono};
      font-size: ${fontSize.xs};
      color: ${t(colors.yellow[700], colors.yellow[400])};
      padding: ${size[1]} ${size[2]};
      background: ${t(colors.yellow[50], colors.yellow[900] + alpha[20])};
      border-radius: ${border.radius.sm};
      border: 1px solid ${t(colors.yellow[200], colors.yellow[800] + alpha[30])};
    `,
    conflictItemAllow: css`
      font-family: ${fontFamily.mono};
      font-size: ${fontSize.xs};
      color: ${t(colors.gray[600], colors.gray[400])};
      padding: ${size[1]} ${size[2]};
      background: ${t(colors.gray[100], colors.darkGray[700])};
      border-radius: ${border.radius.sm};
      border: 1px solid ${t(colors.gray[300], colors.darkGray[600])};
    `,
    conflictItemError: css`
      font-family: ${fontFamily.mono};
      font-size: ${fontSize.xs};
      color: ${t(colors.red[700], colors.red[400])};
      padding: ${size[1]} ${size[2]};
      background: ${t(colors.red[50], colors.red[900] + alpha[20])};
      border-radius: ${border.radius.sm};
      border: 1px solid ${t(colors.red[200], colors.red[900] + alpha[30])};
    `,
    conflictItemScope: css`
      font-family: ${fontFamily.mono};
      font-size: ${fontSize.xs};
      color: ${t(colors.blue[700], colors.blue[400])};
      padding: ${size[1]} ${size[2]};
      background: ${t(colors.blue[50], colors.blue[900] + alpha[20])};
      border-radius: ${border.radius.sm};
      border: 1px solid ${t(colors.blue[200], colors.blue[800] + alpha[30])};
    `,
    optionRow: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${size[1]} 0;
      font-size: ${fontSize.xs};
      border-bottom: 1px solid ${t(colors.gray[200], colors.darkGray[600])};
      &:last-child {
        border-bottom: none;
      }
    `,
    optionLabel: css`
      color: ${t(colors.gray[600], colors.gray[400])};
    `,
    optionValue: css`
      font-family: ${fontFamily.mono};
      color: ${t(colors.gray[900], colors.gray[100])};
    `,
    optionValueTrue: css`
      font-family: ${fontFamily.mono};
      color: ${t(colors.green[600], colors.green[400])};
    `,
    optionValueFalse: css`
      font-family: ${fontFamily.mono};
      color: ${t(colors.red[600], colors.red[400])};
    `,
    tooltip: css`
      position: relative;
      &:hover > [data-tooltip] {
        opacity: 1;
        visibility: visible;
      }
    `,
    tooltipText: css`
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding: ${size[1]} ${size[1.5]};
      background: ${t(colors.gray[800], colors.darkGray[500])};
      color: ${t(colors.white, colors.gray[100])};
      font-size: ${fontSize['2xs']};
      border-radius: ${border.radius.sm};
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 0.15s,
        visibility 0.15s;
      z-index: ${tokens.zIndices.tooltip};
      margin-top: ${size[1]};
    `,
    triggerCount: css`
      font-family: ${fontFamily.mono};
      font-size: ${fontSize['2xs']};
      color: ${t(colors.gray[500], colors.gray[400])};
      margin-left: ${size[1]};
      flex-shrink: 0;
    `,
  }
}

export function useStyles() {
  const { theme } = useTheme()
  const [styles, setStyles] = createSignal(stylesFactory(theme()))
  createEffect(() => {
    setStyles(stylesFactory(theme()))
  })
  return styles
}
