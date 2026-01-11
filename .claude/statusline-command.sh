#!/bin/bash

# 標準入力からJSON入力を受け取る
input=$(cat)

# リセットコード
reset=$'\033[0m'

# 点字文字の配列（アニメーション用）
braille_chars='⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿'

# 時刻ベースのアニメーション（6秒で1周期、ゆっくり）
current_time=$(date +%s)
phase=$((current_time % 6))

# 緑→シアン→青→マゼンタのグラデーション（標準ANSIカラー）
case $phase in
  0) color=$'\033[32m' ;;  # 緑
  1) color=$'\033[36m' ;;  # シアン
  2) color=$'\033[34m' ;;  # 青
  3) color=$'\033[35m' ;;  # マゼンタ
  4) color=$'\033[35m' ;;  # マゼンタ（維持）
  5) color=$'\033[32m' ;;  # 緑に戻る準備
  *) color=$'\033[32m' ;;  # デフォルト（緑）
esac

# 点字文字をランダムに変化させる（RANDOM使用）
get_random_braille() {
  local len=${#braille_chars}
  local idx=$((RANDOM % (len / 3)))  # 点字文字は3バイトなので
  echo "${braille_chars:$((idx * 3)):3}"
}

# ちらちら動く点字パターンを生成
b1=$(get_random_braille)
b2=$(get_random_braille)
b3=$(get_random_braille)
b4=$(get_random_braille)
b5=$(get_random_braille)
b6=$(get_random_braille)
b7=$(get_random_braille)
b8=$(get_random_braille)
b9=$(get_random_braille)
b10=$(get_random_braille)

# 異界圧センサー（グラデーション色）と猫
sensor_line1="* . *.${color}${b1}${b2}${b3}${b4}${b5}${b6}${b7}${b8}${b9}${b10}${reset}. *  |\__/,|   (\`\\"
sensor_line2="    ${color}▁▂⠆${b2}${b3}${b4}${b5}${b6}${b7}${b8}${b9}${b3}⠧⠆▂▁${reset}  _.| ⚆ ⚆ |_   ) )"
sensor_line3='    ---------------------(((---(((----------'

# 3行のセンサーを結合
sensor=$(printf '%s\n%s\n%s' "$sensor_line1" "$sensor_line2" "$sensor_line3")

# デフォルト部分（左側）
default_part="$(whoami)@$(hostname -s):$(pwd | sed "s|^$HOME|~|")"

# モデル名とトークン使用率を取得
model_name=$(echo "$input" | jq -r '.model.display_name // .model.name // "unknown"')

# トークン使用量を取得
input_tokens=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0')
output_tokens=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0')
size=$(echo "$input" | jq -r '.context_window.context_window_size // 0')

# トークン使用率を計算
if [ "$size" -gt 0 ] 2>/dev/null; then
  current=$((input_tokens + output_tokens))
  pct=$((current * 100 / size))

  # 80%以上で色を変更（80-89: 黄色、90以上: 赤）
  if [ $pct -ge 90 ]; then
    token_display=$(printf '\033[31m%d%%\033[0m' "$pct")  # 赤
  elif [ $pct -ge 80 ]; then
    token_display=$(printf '\033[33m%d%%\033[0m' "$pct")  # 黄色
  else
    token_display=$(printf '%d%%' "$pct")
  fi

  right_part="[$model_name | $token_display]"
else
  right_part="[$model_name]"
fi

# 1行目：通常のステータス（左側 + 右側のClaudeインジケーター）
# 2-4行目：猫の異界圧センサー
printf '%s %s\n%s' "$default_part" "$right_part" "$sensor"
