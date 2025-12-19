# 调试指南 - Debug Guide

## 如何测试和调试

### 1. 打开浏览器控制台
- 按 `F12` 或右键点击页面 → "检查" / "Inspect"
- 切换到 **Console（控制台）** 标签

### 2. 测试 New Game 按钮

**步骤：**
1. 点击 "New Game" 按钮
2. 查看控制台，应该看到：
   ```
   === RESET GAME BUTTON CLICKED ===
   handleResetGame called
   === resetGame FUNCTION CALLED ===
   Timer stopped
   Board reset
   Current player set to white
   All game state reset
   Timer started
   resetGame completed successfully
   ```

**如果看不到这些日志：**
- 按钮可能没有正确绑定事件
- 检查是否有 JavaScript 错误

### 3. 测试走棋功能

**步骤：**
1. 点击一个白方棋子（例如：e2 的兵）
2. 查看控制台，应该看到：
   ```
   selectSquare called: { pos: {...}, currentPlayer: 'white' }
   Selecting own piece: pawn
   Valid moves: X
   ```
3. 点击一个合法走法位置
4. 查看控制台，应该看到：
   ```
   selectSquare: trying to move { from: {...}, to: {...}, isValidMove: true, ... }
   Move is valid, calling makeMove...
   makeMove called: { from: {...}, to: {...}, ... }
   Player switched: { from: 'white', to: 'black' }
   currentPlayer changed: { from: 'white', to: 'black' }
   ```

**如果玩家没有切换：**
- 检查是否看到 "Player switched" 日志
- 检查是否看到 "currentPlayer changed" 日志
- 如果没有，可能是响应式更新问题

### 4. 测试 Undo 按钮

**步骤：**
1. 先走几步棋
2. 点击 "Undo" 按钮
3. 查看控制台，应该看到：
   ```
   === UNDO BUTTON CLICKED ===
   handleUndo called! { moveHistoryLength: X, ... }
   Calling undoMove()...
   === undoMove FUNCTION CALLED ===
   undoMove called, moveHistory length: X
   Timer stopped, proceeding with undo...
   ```

**如果按钮不工作：**
- 检查按钮是否被禁用（灰色）
- 检查 `canUndo` 的值
- 查看是否有错误信息

### 5. 测试计时器

**步骤：**
1. 点击 "New Game"
2. 等待几秒钟
3. 查看计时器是否在增加
4. 走一步棋
5. 查看计时器是否切换到另一个玩家

**如果计时器不工作：**
- 检查是否看到 "Timer started" 日志
- 检查控制台是否有错误
- 检查 `whiteTime` 和 `blackTime` 的值是否在变化

## 常见问题排查

### 问题 1: 按钮点击没有反应

**检查：**
- 打开控制台，查看是否有错误
- 检查按钮是否被禁用（`:disabled` 属性）
- 尝试点击按钮，查看是否有日志输出

### 问题 2: 玩家不切换

**检查：**
- 查看控制台是否有 "Player switched" 日志
- 查看是否有 "currentPlayer changed" 日志
- 检查 `currentPlayer` 的值是否正确更新

### 问题 3: Undo 按钮不工作

**检查：**
- 确保已经走了至少一步棋
- 检查按钮是否被禁用
- 查看 `canUndo` 的值
- 检查是否有兵升变待处理

### 问题 4: 计时器不工作

**检查：**
- 查看是否看到 "Timer started" 日志
- 检查 `startTimer` 函数是否被调用
- 检查 `whiteTime` 和 `blackTime` 的值

## 快速诊断命令

在浏览器控制台中运行以下命令来检查状态：

```javascript
// 检查游戏状态
console.log('Current Player:', window.vueApp?.currentPlayer)
console.log('Move History:', window.vueApp?.moveHistory?.length)
console.log('Game Status:', window.vueApp?.gameStatus)
```

## 如果所有功能都不工作

1. **检查 JavaScript 是否加载**
   - 查看控制台是否有加载错误
   - 检查网络标签，确保所有文件都加载成功

2. **检查 Vue 是否正确初始化**
   - 查看控制台是否有 Vue 相关错误
   - 检查页面元素是否正确渲染

3. **清除缓存并刷新**
   - 按 `Ctrl+Shift+R` (Windows/Linux) 或 `Cmd+Shift+R` (Mac) 强制刷新
   - 清除浏览器缓存

4. **检查浏览器兼容性**
   - 确保使用现代浏览器（Chrome, Firefox, Edge 最新版本）
   - 检查浏览器控制台是否有兼容性警告

## 报告问题

如果问题仍然存在，请提供：
1. 浏览器控制台的完整错误信息
2. 点击按钮时的控制台日志
3. 浏览器类型和版本
4. 具体的操作步骤

