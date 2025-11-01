# 🎈 BUBBLE.IO MIGRATION GUIDE

Complete step-by-step guide to migrate this React app to Bubble.io.

---

## 📋 Table of Contents

1. [Data Structure Migration](#1-data-structure-migration)
2. [UI Components Migration](#2-ui-components-migration)
3. [Workflow Migration](#3-workflow-migration)
4. [API Integration](#4-api-integration)
5. [JSON Parsing in Bubble](#5-json-parsing-in-bubble)
6. [Visual Reference](#6-visual-reference)

---

## 1. Data Structure Migration

### Step 1.1: Create Data Types

In Bubble **Data** tab → **New Type**

#### Data Type: `Stock_Master`

| Field Name | Field Type | Settings |
|-----------|------------|----------|
| symbol | text | Unique |
| name | text | |
| sector | text | |
| current_price | number | |
| price_change_pct | number | |
| market_cap | number | |
| last_price_update | date | |
| in_watchlist | yes/no | Default: no |
| date_added_watchlist | date | |
| discovery_source | text | |
| user_tags | text | Multiple entries |

#### Data Type: `Stock_Profile`

| Field Name | Field Type | Settings |
|-----------|------------|----------|
| stock | Stock_Master | Required |
| profile_version | number | Default: 1 |
| last_updated | date | Auto-update |
| user_notes | text | Long text |
| overall_conviction | number | |
| confidence_level | text | Options: High/Medium/Low |
| data_quality | text | |
| grok_perplexity_agreement | number | |
| cross_check_status | text | |
| **a3_technical_json** | **text** | **Long text** |
| **a3_fundamental_json** | **text** | **Long text** |
| **a3_sentiment_json** | **text** | **Long text** |
| **a3_meta_json** | **text** | **Long text** |
| **a3_risk_json** | **text** | **Long text** |
| custom_weights_json | text | Long text |

#### Data Type: `Chat_History`

| Field Name | Field Type |
|-----------|------------|
| timestamp | date |
| user_message | text (long) |
| intent_parsed | text |
| grok_response | text (long) |
| perplexity_response | text (long) |
| synthesized_response | text (long) |
| resulted_in_action | yes/no |

---

## 2. UI Components Migration

### Page: `Dashboard` (Main Page)

#### Layout Structure

```
Page: Dashboard
├── Header (Reusable Element)
├── Group: ChatSection
│   ├── RepeatingGroup: Messages
│   ├── Input: ChatInput
│   └── Button: SendButton
├── Group: ConvictionGridSection (Hidden by default)
│   └── RepeatingGroup: Dimensions
└── Group: QuickStats
    ├── Group: WatchlistCard
    ├── Group: AIModelsCard
    └── Group: MVPPhaseCard
```

### 2.1 Header (Reusable Element)

**Element Type**: Reusable Element `Header`

**Contents**:
- Group: Container (full width, fixed top)
  - Image: Logo
  - Text: "LEON FINANCE"
  - Text: "Investment Operating System v3.0" (smaller)
  - Text: Current stock (conditional, when `Current Stock` is not empty)
  - Icon: Settings button

**Styling**:
- Background: Dark (#1e293b)
- Border bottom: 1px #475569
- Position: Fixed top

### 2.2 Chat Interface

**RepeatingGroup: `Messages`**
- Type of content: `Chat_History`
- Data source: `Do a search for Chat_History:sorted by timestamp:descending`
- Layout: Full list (vertical)
- Max items: 50
- Scrolling: Vertical scrolling, reversed

**Cell Contents**:
- Group: MessageBubble
  - Conditional formatting:
    - If `This Chat_History's user_message is not empty` → Right align, blue background
    - Otherwise → Left align, gray background
  - Text: `This Chat_History's synthesized_response`

**Input: `ChatInput`**
- Type: Multiline
- Placeholder: "Ask Leon... (e.g., 'Analyze RIOT')"
- Initial content: empty

**Button: `SendButton`**
- Text: "Send"
- When clicked → Workflow: `Send Chat Message`

### 2.3 Conviction Grid

**RepeatingGroup: `Dimensions`**
- Type of content: **text** (manual data source)
- Data source: Create a list
  ```
  Technical
  Fundamental
  Sentiment
  Meta
  Risk
  ```
- Layout: Column (1 column)
- Height: Auto

**Cell Contents**:

```
Group: DimensionCard
├── Group: DimensionHeader (Clickable)
│   ├── Icon: Emoji (conditional based on This text)
│   ├── Text: This text (dimension name)
│   ├── Text: Score (extracted from JSON - see below)
│   └── ProgressBar: Visual score
└── Group: DimensionExpanded (Conditional, collapsed by default)
    ├── Group: GrokReasoning
    │   └── Text: Reasoning (extracted from JSON)
    ├── Group: SubScores
    │   └── RepeatingGroup: SubScoreItems (custom state)
    └── Group: Sources
        └── RepeatingGroup: SourceLinks
```

**Icon Mapping** (use conditional):
```
When This text = "Technical" → Show 📈
When This text = "Fundamental" → Show 💰
When This text = "Sentiment" → Show 🎯
When This text = "Meta" → Show 🧠
When This text = "Risk" → Show ⚠️
```

---

## 3. Workflow Migration

### Workflow 1: `Send Chat Message`

**Trigger**: Button `SendButton` is clicked

**Steps**:

**Step 1**: Make changes to a thing
- Thing to change: Create a new `Chat_History`
- Fields:
  - user_message = `ChatInput's value`
  - timestamp = Current date/time

**Step 2**: API Call - `Send Chat to Backend`
- API: `POST /api/chat`
- Body: `{ "message": ChatInput's value }`
- Store result in: Result of Step 2

**Step 3**: Make changes to a thing
- Thing to change: Result of Step 1 (the Chat_History we created)
- Fields:
  - synthesized_response = `Result of Step 2's message`
  - intent_parsed = `Result of Step 2's intent's component`

**Step 4**: Only when `Result of Step 2's componentData is not empty`
- Set state: `CurrentStock` = `Result of Step 2's componentData's data's symbol`
- Show element: `ConvictionGridSection`
- Scroll to: `ConvictionGridSection`

**Step 5**: Reset inputs
- Reset `ChatInput`
- Scroll `Messages` to bottom

### Workflow 2: `Expand Dimension`

**Trigger**: Group `DimensionHeader` is clicked

**Steps**:

**Step 1**: Toggle element
- Element to toggle: `This DimensionCard's DimensionExpanded`

### Workflow 3: `Analyze Stock` (alternative to chat)

**Trigger**: Button "Analyze" is clicked

**Steps**:

**Step 1**: API Call - `Analyze Stock`
- API: `POST /api/stocks/{symbol}/analyze`
- Parameters: symbol = `CurrentStock`

**Step 2**: Create/Update `Stock_Profile`
- Parse JSON and save to database fields

---

## 4. API Integration

### Setup: API Connector Plugin

Install **API Connector** plugin in Bubble.

### API 1: Chat API

**Name**: `LeonChat`

**Authentication**: None (for local testing) or API Key

**Call Configuration**:

```
Name: SendChatMessage
Type: POST
Use as: Action
URL: http://localhost:3001/api/chat
(Production: https://your-backend.com/api/chat)

Headers:
Content-Type: application/json

Body type: JSON
Body:
{
  "message": <message>
}

Response:
message (text)
intent (object)
  - component (text)
  - action (text)
  - stocks (list of text)
  - confidence (number)
componentData (object)
  - type (text)
  - data (object)
```

**Initialize Call** with test data:
```json
{
  "message": "Analyze RIOT"
}
```

Bubble will auto-detect the response structure.

### API 2: Stock Analysis API

```
Name: AnalyzeStock
Type: POST
Use as: Data
URL: http://localhost:3001/api/stocks/<symbol>/analyze

Path parameters:
symbol (text)

Response will be the full conviction grid JSON.
```

### API 3: Get Stock Profile

```
Name: GetStockProfile
Type: GET
Use as: Data
URL: http://localhost:3001/api/stocks/<symbol>/profile
```

---

## 5. JSON Parsing in Bubble

### The Challenge

Bubble stores JSON as text. To display sub-scores from `a3_technical_json`, you need to **extract** values.

### Method 1: Native JSONata (Built-in)

**Extracting Overall Score**:

```
Text element:
Dynamic data = Stock_Profile's a3_technical_json:extract with JSONata "overall_score"
```

**Extracting Sub-Score**:

```
Text element:
Dynamic data = Stock_Profile's a3_technical_json:extract with JSONata "sub_scores.price_momentum"
```

**Extracting Reasoning**:

```
Text element:
Dynamic data = Stock_Profile's a3_technical_json:extract with JSONata "reasoning_grok"
```

### Method 2: JSON Machine Plugin

For more complex parsing (loops, arrays):

1. Install **JSON Machine** plugin
2. Use it to parse the entire JSON into a structure
3. Access fields like normal Bubble data

**Example**:

```
Text element:
Source: JSON Machine Parse(Stock_Profile's a3_technical_json)
Dynamic data = This JSON's get("sub_scores.price_momentum")
```

### Common Extractions

| What to Display | JSONata Expression |
|----------------|-------------------|
| Overall score | `"overall_score"` |
| Price momentum | `"sub_scores.price_momentum"` |
| All sub-scores | `"sub_scores"` (returns object) |
| Grok reasoning | `"reasoning_grok"` |
| Sources array | `"sources"` |

### Displaying Sub-Scores in Repeating Group

**Challenge**: `sub_scores` is an object with dynamic keys.

**Solution**:

1. Install **Toolbox** plugin (or JSON Machine)
2. Parse JSON to get keys
3. Create a repeating group of those keys
4. For each key, extract the value

**Alternative (Manual)**:

Create a custom state `SubScoresList` of type `text` (list).

Populate it with:
```
price_momentum
volume_strength
vwap_position
rsi
macd
...
```

Then in repeating group:
- Data source: `SubScoresList`
- Text: This text
- Value: `Stock_Profile's a3_technical_json:extract with JSONata ("sub_scores." & This text)`

---

## 6. Visual Reference

### Conviction Grid in Bubble

**Structure**:

```
Group: ConvictionGridContainer
├── Text: Symbol (e.g., "RIOT")
├── Text: Overall Conviction (8.2/10)
├── Text: Confidence Level (High)
├── Text: Agreement % (91%)
│
└── RepeatingGroup: Dimensions (5 items)
    └── Cell: DimensionCard
        ├── Group: Header (always visible)
        │   ├── Icon: 📈
        │   ├── Text: "Technical"
        │   ├── Text: "7.5/10"
        │   └── Shape: Progress bar
        │       └── Shape: Fill (width = 75%)
        │
        └── Group: Expanded (conditional, hidden by default)
            ├── Group: GrokReasoning
            │   └── Text: (extracted from JSON)
            ├── Group: PerplexityReasoning
            │   └── Text: (extracted from JSON)
            └── RepeatingGroup: SubScores
                └── Cell:
                    ├── Text: "Price Momentum"
                    └── Text: "8.0"
```

### Progress Bar Implementation

**Element**: Shape (Rectangle)

**Container**:
- Shape: Background bar
  - Width: 100% (or fixed, e.g., 300px)
  - Height: 8px
  - Background: #475569 (gray)
  - Border radius: 4px

**Fill**:
- Shape: Progress fill (inside container)
  - Width: Dynamic → `This Dimension's score × 10`%
    - Example: If score = 7.5 → Width = 75%
  - Height: 100%
  - Background: Color based on dimension
    - Technical: #2563eb (blue)
    - Fundamental: #10b981 (green)
    - Sentiment: #9333ea (purple)
    - Meta: #ea580c (orange)
    - Risk: #ef4444 (red)
  - Border radius: 4px

### Extracting Dimension Score

Since dimensions are in separate JSON fields:

**Technical Score**:
```
Stock_Profile's a3_technical_json:extract with JSONata "overall_score"
```

**Conditional Text Color for Dimension** (in RG cell):

```
When This text = "Technical" → Extract from a3_technical_json
When This text = "Fundamental" → Extract from a3_fundamental_json
When This text = "Sentiment" → Extract from a3_sentiment_json
When This text = "Meta" → Extract from a3_meta_json
When This text = "Risk" → Extract from a3_risk_json
```

This requires 5 conditional expressions.

---

## 7. Testing in Bubble

### Test Checklist

1. **Data Types**: Create all 3 data types ✓
2. **API Connector**: Initialize calls ✓
3. **Chat Interface**: Build UI ✓
4. **Workflow**: Send message → See response ✓
5. **JSON Parsing**: Display overall_conviction ✓
6. **Conviction Grid**: Display 5 dimensions ✓
7. **Expand/Collapse**: Click dimension → Show sub-scores ✓
8. **Styling**: Match dark theme ✓

### Test Data

Use the **Data** tab to manually create:

**Stock_Master** record:
- symbol: RIOT
- name: Riot Platforms
- current_price: 12.45

Then run the API call to populate `Stock_Profile`.

---

## 8. Bubble-Specific Tips

### Performance

1. **Lazy Load**: Don't load conviction grid until user clicks "Analyze"
2. **JSON Caching**: Store extracted values in custom states to avoid re-parsing
3. **Pagination**: For chat history, use pagination (load more pattern)

### Responsive Design

- Use Bubble's responsive engine
- Mobile: Stack elements vertically
- Desktop: Side-by-side layout

### Custom States

Useful states:
- `CurrentStock` (text) - Which stock is being viewed
- `ExpandedDimension` (text) - Which dimension is expanded
- `LoadingAnalysis` (yes/no) - Show loading spinner

### Reusable Elements

Create these as reusable:
- `Header`
- `DimensionCard` (with parameters: dimension_name, json_field)
- `ProgressBar` (with parameters: score, color)

---

## 9. Cost Comparison

| Feature | React App | Bubble App |
|---------|-----------|------------|
| **Development Time** | 1 week (code) | 2-3 days (visual) |
| **Hosting** | $10/mo (Vercel + Railway) | $29/mo (Bubble Pro) |
| **Scalability** | High (DIY) | Medium (Bubble limits) |
| **Customization** | 100% | 90% |
| **No-Code** | ❌ | ✅ |

---

## 10. Final Checklist

Before going live on Bubble:

- [ ] All data types created
- [ ] API Connector configured and tested
- [ ] Chat interface functional
- [ ] Conviction grid displays correctly
- [ ] JSON parsing working for all dimensions
- [ ] Expand/collapse interaction smooth
- [ ] Mobile responsive
- [ ] Backend deployed (Railway/Render)
- [ ] API URLs updated in Bubble
- [ ] Environment variables set
- [ ] Privacy rules configured
- [ ] Workflows tested end-to-end

---

**You now have a complete guide to migrate the React app to Bubble.io!**

For questions, refer to:
- This guide
- The main README.md
- Code comments in the React app (marked "BUBBLE MIGRATION NOTE")
