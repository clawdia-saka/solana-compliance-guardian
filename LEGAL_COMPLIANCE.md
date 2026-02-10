# 非弁行為対策チェックリスト

## 🚨 Critical Legal Compliance Requirements

### 弁護士法第72条（非弁行為）対策

**禁止行為:**
- 報酬を得て法律事務を行うこと（弁護士資格なし）
- 法律判断・法律相談の提供

**本ツールの位置づけ:**
- ✅ 自動スクリーニングツール（Automated screening tool）
- ✅ 情報提供のみ（Information only）
- ❌ 法律相談ではない（NOT legal advice）
- ❌ 法的判断の代替ではない（NOT substitute for legal counsel）

---

## 📋 Required Disclaimers

### 1. Dashboard Hero Section
```
⚠️ DISCLAIMER: This is an automated screening tool for informational purposes only.
NOT legal advice. Consult a licensed attorney (弁護士) in Japan for compliance matters.
```

### 2. Audit Results Page (Top)
```
⚖️ Legal Notice:
This analysis is provided for informational purposes only and does not constitute
legal advice. For regulatory compliance in Japan, consult a qualified attorney (弁護士).

この分析は情報提供のみを目的としており、法律相談ではありません。
日本での規制対応については、資格を持つ弁護士にご相談ください。
```

### 3. Footer (All Pages)
```
⚠️ Not Legal Advice | Automated Screening Tool Only | Consult Licensed Attorney
```

### 4. API Response
Every API response must include:
```json
{
  "disclaimer": "This analysis is for informational purposes only and does not constitute legal advice. Consult a qualified attorney in Japan for compliance matters.",
  "disclaimer_jp": "この分析は情報提供のみを目的としており、法律相談ではありません。日本での規制対応については資格を持つ弁護士にご相談ください。"
}
```

---

## 🔧 Implementation Checklist

### High Priority (Before Submission)
- [ ] Add disclaimer to Dashboard hero section
- [ ] Add legal notice to audit results page (top, prominent)
- [ ] Update footer with disclaimer on all pages
- [ ] Add disclaimer to API responses (torii-api)
- [ ] Update README.md to emphasize "screening tool" positioning

### Medium Priority
- [ ] Change "Auditor" → "Screening Tool" in branding (optional)
- [ ] Add tooltip on "Risk Score": "Automated risk assessment only"
- [ ] Create separate Legal Notice page (/legal-notice)

### Documentation
- [ ] SUBMISSION.md: Clarify tool positioning
- [ ] README.md: Strengthen disclaimer section
- [ ] Add bilingual disclaimers (EN + JP)

---

## 📝 Safe Wording Examples

### ✅ SAFE
- "Automated compliance screening"
- "Risk assessment tool"
- "Informational analysis"
- "Screening report"
- "We recommend consulting a licensed attorney"

### ❌ AVOID
- "Legal advice"
- "Compliance certification"
- "Regulatory approval"
- "Legal guarantee"
- "Replace attorney consultation"

---

## 🎯 Key Principle

**Always position as:**
"A data analysis tool that helps identify potential compliance considerations,
NOT a substitute for professional legal counsel."

**日本語:**
「潜在的なコンプライアンス上の考慮事項を特定するデータ分析ツールであり、
専門的な法律相談の代替ではありません。」
