# 📋 STARTUP OBITUARIES FRONTEND REQUIREMENTS
**Fill out this document and send it back to get your complete React frontend**

---

## 🏷️ PROJECT INFORMATION
```yaml
project_name: "Startup Obituaries"
your_name: ""
contact_email: ""
deadline: ""
budget_range: ""
```

---

## ⚙️ TECH STACK PREFERENCES
```yaml
frontend_framework: "React 18"        # React 18 / Next.js / Vite
styling: "Tailwind CSS"               # Tailwind CSS / Styled Components / Material-UI
state_management: "Zustand"           # Zustand / Redux Toolkit / Context API
form_handling: "React Hook Form"      # React Hook Form / Formik / Custom
routing: "React Router v6"            # React Router v6 / Next Router
animations: "Framer Motion"           # Framer Motion / GSAP / CSS animations
ui_components: "Custom + Headless UI" # Material-UI / Ant Design / Custom / Headless UI
http_client: "Axios"                  # Axios / Fetch / React Query
bundler: "Vite"                       # Vite / Create React App / Webpack
typescript: false                     # true / false
```

---

## 🎨 DESIGN & BRANDING
### Brand Identity
```yaml
project_tagline: ""                   # e.g., "Where failure becomes wisdom"
brand_personality: ""                 # e.g., "empathetic, professional, inspiring"
target_audience: ""                   # e.g., "entrepreneurs, founders, startup community"
competitive_inspiration: ""           # e.g., "LinkedIn + Medium + Behance"
```

### Color Palette (FILL WITH HEX CODES)
```yaml
# Primary Brand Colors
primary_brand_color: "#"              # Main brand color
secondary_brand_color: "#"            # Secondary brand color
accent_color: "#"                     # Accent/highlight color
background_primary: "#"               # Main background
background_secondary: "#"             # Secondary background
text_primary: "#"                     # Main text color
text_secondary: "#"                   # Secondary text color

# Semantic Colors
success_color: "#"                    # Success messages/buttons
error_color: "#"                      # Error messages/buttons
warning_color: "#"                    # Warning messages
info_color: "#"                       # Info messages

# Action Colors
upvote_color: "#"                     # Upvote button color
downvote_color: "#"                   # Downvote button color
neutral_action: "#"                   # Neutral action buttons
```

### Typography
```yaml
primary_font: ""                      # e.g., "Inter", "Roboto", "Poppins"
secondary_font: ""                    # For quotes/emphasis, e.g., "Crimson Text"
mono_font: ""                         # For code/data, e.g., "JetBrains Mono"
heading_style: ""                     # modern / classic / bold
body_text_size: "16px"                # 14px / 16px / 18px
line_height: "1.6"                    # 1.4 / 1.5 / 1.6 / 1.7
```

### Visual Style
```yaml
border_radius: "8px"                  # 0px / 4px / 8px / 16px / 24px
shadow_style: "soft"                  # none / soft / sharp / neumorphism
card_style: "elevated"                # flat / elevated / outlined
button_style: "rounded"               # rounded / square / pill
spacing_scale: "1.5"                  # 1.2 / 1.25 / 1.5 / 1.618
```

---

## 🏗️ LAYOUT REQUIREMENTS
### Navigation Structure
```yaml
header_style: "sticky"                # sticky / fixed / static
navigation_type: "sidebar + top"      # sidebar / top-only / sidebar+top
logo_position: "top-left"             # top-left / top-center / top-right
user_menu_position: "top-right"       # top-left / top-right

# Main Navigation Items (ADD YOUR ITEMS)
main_nav_items:
  - { label: "Feed", path: "/dashboard", icon: "Home" }
  - { label: "My Startups", path: "/my-startups", icon: "Building" }
  - { label: "Create", path: "/create", icon: "Plus" }
  # ADD MORE ITEMS HERE
```

### Page Layout
```yaml
max_content_width: "1200px"           # 1024px / 1200px / 1400px / full
sidebar_width: "280px"                # 240px / 280px / 320px
grid_system: "12-column"              # 12-column / flexbox / css-grid
mobile_breakpoint: "768px"            # 640px / 768px / 1024px
tablet_breakpoint: "1024px"           # 768px / 1024px / 1280px
```

---

## 📄 PAGES TO BUILD

### 🏠 Landing Page (/) - REQUIRED
```yaml
hero_section:
  headline: ""                        # Your main headline
  subheadline: ""                     # Supporting text
  cta_primary: ""                     # Main button text
  cta_secondary: ""                   # Secondary button text
  background_style: "gradient"        # image / gradient / video / solid

sections_needed:                      # CHECK WHICH YOU WANT
  - [ ] hero_section
  - [ ] featured_stories
  - [ ] statistics_counter
  - [ ] testimonials
  - [ ] how_it_works
  - [ ] call_to_action
```

### 🔐 Authentication Pages - REQUIRED
```yaml
login_page:
  layout: "split_screen"              # centered / split_screen / minimal
  left_content: "inspirational_quote" # quote / image / video / none
  social_login: false                 # true / false
  remember_me: true                   # true / false
  forgot_password: true               # true / false

register_page:
  layout: "split_screen"              # centered / split_screen / minimal
  fields_required:                    # CHECK REQUIRED FIELDS
    - [ ] username
    - [ ] email
    - [ ] password
    - [ ] confirm_password
    - [ ] user_type
    - [ ] first_name
    - [ ] last_name
  terms_checkbox: true                # true / false
```

### 📱 Dashboard/Feed Page - REQUIRED
```yaml
layout: "three_column"                # single / two_column / three_column

left_sidebar:                         # CHECK WHAT TO INCLUDE
  - [ ] user_quick_stats
  - [ ] navigation_menu
  - [ ] quick_actions
  - [ ] trending_topics
  - [ ] recent_activity

main_content:                         # MAIN FEED AREA
  - [ ] feed_header_with_filters
  - [ ] startup_cards_feed
  - [ ] infinite_scroll
  - [ ] pagination

right_sidebar:                        # CHECK WHAT TO INCLUDE
  - [ ] suggested_connections
  - [ ] leaderboard_preview
  - [ ] recent_activity
  - [ ] promoted_content

feed_filters:                         # LIST YOUR FILTER OPTIONS
  - "All Stories"
  - "Most Upvoted"
  # ADD MORE FILTERS HERE
```

### ✏️ Create Startup Obituary - REQUIRED
```yaml
form_type: "multi_step_wizard"        # single_page / multi_step_wizard

# STEP 1
step_1_title: "Basic Information"
step_1_fields:                        # CHECK FIELDS TO INCLUDE
  - [ ] startup_name
  - [ ] description
  - [ ] industry
  - [ ] founded_year
  - [ ] died_year
  - [ ] is_anonymous

# STEP 2
step_2_title: "Failure Analysis"
step_2_fields:
  - [ ] primary_failure_reason
  - [ ] autopsy_report
  - [ ] stage_at_death

# STEP 3
step_3_title: "Metrics & Funding"
step_3_fields:
  - [ ] funding_amount_usd
  - [ ] key_investors
  - [ ] peak_metrics
  - [ ] links

# STEP 4
step_4_title: "Lessons Learned"
step_4_fields:
  - [ ] lessons_learned
  - [ ] advice_for_founders

save_draft: true                      # true / false
progress_indicator: true              # true / false
validation: "real_time"               # real_time / on_submit
```

### 📖 Startup Detail Page - REQUIRED
```yaml
layout: "article_style"              # article_style / two_column

sections:                            # CHECK SECTIONS TO INCLUDE
  - [ ] startup_header
  - [ ] failure_reason_highlight
  - [ ] full_description
  - [ ] autopsy_report
  - [ ] metrics_visualization
  - [ ] lessons_learned_section
  - [ ] team_members_grid
  - [ ] related_startups
  - [ ] comments_section

sidebar_content:                     # CHECK SIDEBAR CONTENT
  - [ ] reaction_panel
  - [ ] share_buttons
  - [ ] team_stats
  - [ ] founder_contact

interaction_features:                # CHECK INTERACTIONS NEEDED
  - [ ] upvote_downvote
  - [ ] bookmark_save
  - [ ] share_social
  - [ ] report_content
  - [ ] join_team_request
```

### 👤 User Profile Page - REQUIRED
```yaml
layout: "linkedin_style"             # linkedin_style / github_style / custom

sections:                            # CHECK SECTIONS TO INCLUDE
  - [ ] profile_header
  - [ ] about_section
  - [ ] startup_history
  - [ ] skills_tags
  - [ ] connections_preview
  - [ ] activity_feed

editable_fields:                     # WHEN USER VIEWS OWN PROFILE
  - [ ] first_name
  - [ ] last_name
  - [ ] bio
  - [ ] skills
  - [ ] linkedin_url
  - [ ] github_url
  - [ ] open_to_work
```

### 🏆 OPTIONAL PAGES (CHECK WHICH YOU WANT)
```yaml
additional_pages:
  - [ ] Leaderboards page
  - [ ] Search/Browse page
  - [ ] Messages/Chat page
  - [ ] Connections/Network page
  - [ ] Settings page
  - [ ] Help/FAQ page
  - [ ] About Us page
  - [ ] Terms & Privacy page
```

---

## 🔧 FUNCTIONALITY REQUIREMENTS

### User Authentication
```yaml
registration_flow: "email_verification" # direct / email_verification / admin_approval
login_options:                          # CHECK OPTIONS YOU WANT
  - [ ] email_password
  - [ ] google_oauth
  - [ ] linkedin_oauth
  - [ ] github_oauth
password_requirements: "strong"         # basic / strong / custom
session_duration: "7_days"              # 1_day / 7_days / 30_days / never
```

### Search & Filtering
```yaml
search_features:                        # CHECK FEATURES YOU WANT
  - [ ] global_search_bar
  - [ ] advanced_filters
  - [ ] autocomplete_suggestions
  - [ ] search_history
  - [ ] saved_searches

filter_options:                         # CHECK FILTER OPTIONS
  - [ ] by_industry
  - [ ] by_failure_reason
  - [ ] by_funding_stage
  - [ ] by_year_range
  - [ ] by_location
  - [ ] by_team_size
```

### Social Features
```yaml
reaction_system: "upvote_downvote"      # like_only / upvote_downvote / emoji_reactions
commenting: "threaded"                  # flat / threaded / none
connection_system: "linkedin_style"     # auto_follow / linkedin_style / none
messaging: "connection_based"           # open / connection_based / none
notifications: "in_app"                 # email / in_app / push / all
```

---

## 📱 MOBILE & RESPONSIVE

### Mobile Requirements
```yaml
mobile_first: true                      # true / false
touch_interactions: true                # true / false
swipe_gestures: true                    # true / false
mobile_navigation: "bottom_tabs"        # hamburger / bottom_tabs / slide_drawer
mobile_forms: "simplified"              # same / simplified / wizard
```

### Performance Targets
```yaml
loading_strategy: "lazy_loading"        # eager / lazy_loading / intersection_observer
image_optimization: true                # true / false
code_splitting: true                    # true / false
bundle_size_target: "< 1MB"             # < 500KB / < 1MB / < 2MB
lighthouse_score_target: "90+"          # 80+ / 90+ / 95+
```

---

## 🎯 UNIQUE FEATURES

### Special Features You Want
```yaml
custom_features:                        # CHECK OR ADD YOUR IDEAS
  - [ ] failure_reason_analytics
  - [ ] team_reunion_finder
  - [ ] mentor_matching
  - [ ] anonymous_mode
  - [ ] startup_graveyard_map
  - [ ] lessons_aggregator
  - [ ] success_story_tracker
  - [ ] investor_feedback_system
  # ADD YOUR CUSTOM IDEAS HERE:
  - ""
  - ""

gamification:                           # CHECK IF YOU WANT GAMIFICATION
  - [ ] user_badges
  - [ ] leaderboards
  - [ ] achievement_system
  - [ ] contribution_points
  - [ ] streak_counters
```

### Content Guidelines
```yaml
tone_of_voice: "empathetic_professional" # casual / professional / empathetic_professional
content_moderation: "community_driven"   # none / admin / community_driven
language_support: "english_only"         # english_only / multilingual
accessibility_level: "WCAG_AA"           # basic / WCAG_AA / WCAG_AAA
```

---

## 🚀 LAUNCH STRATEGY

### MVP Features (MUST HAVE)
```yaml
mvp_features:                           # CHECK MINIMUM FEATURES
  - [ ] user_registration_login
  - [ ] create_obituary
  - [ ] browse_feed
  - [ ] basic_reactions
  - [ ] user_profiles
  - [ ] comments_system
```

### Nice-to-Have Features (POST LAUNCH)
```yaml
future_features:                        # CHECK FUTURE FEATURES
  - [ ] advanced_analytics
  - [ ] team_management
  - [ ] messaging_system
  - [ ] leaderboards
  - [ ] mobile_app
  - [ ] api_for_third_parties
```

### Timeline
```yaml
development_timeline: ""                # e.g., "6 weeks", "3 months"
launch_target: ""                       # e.g., "Q2 2024", "December 2024"
beta_testing: "closed_beta"             # open_beta / closed_beta / none
```

---

## 📝 DELIVERY PREFERENCES

### Code Format
```yaml
file_structure: "complete_project"      # individual_files / complete_project
code_comments: "extensive"              # minimal / moderate / extensive
setup_instructions: "detailed"          # basic / detailed / video_walkthrough
readme_included: true                   # true / false
```

### Documentation
```yaml
component_docs: true                    # true / false (Storybook)
api_integration_guide: true             # true / false
deployment_guide: true                  # true / false
user_manual: false                      # true / false
design_system_docs: true                # true / false
```

---

## 💰 BUDGET & TIMELINE
```yaml
budget_range: ""                        # e.g., "$5,000 - $10,000"
payment_schedule: ""                    # e.g., "50% upfront, 50% on delivery"
timeline: ""                            # e.g., "6 weeks from start"
maintenance_needed: ""                  # none / monthly / as-needed
```

---

## 📞 CONTACT & NEXT STEPS
```yaml
your_name: ""
email: ""
phone: ""                               # optional
preferred_communication: ""             # email / slack / discord / phone
timezone: ""                            # e.g., "PST", "EST", "GMT"
```

### Questions for You
```yaml
# Please answer these:
existing_design_assets: ""              # Do you have logo, brand guidelines, etc?
hosting_preference: ""                  # Vercel, Netlify, AWS, etc?
domain_ready: ""                        # Do you have a domain name?
backend_api_ready: ""                   # Is your backend API complete?
content_ready: ""                       # Do you have sample content/copy?
```

---

## ✅ SUBMISSION CHECKLIST
**Before sending this back, make sure you've filled out:**
- [ ] All color codes with actual hex values
- [ ] Specific page requirements for each page you want
- [ ] Navigation menu items with exact labels
- [ ] Must-have vs nice-to-have features clearly marked
- [ ] Your timeline and budget information
- [ ] Contact details

---

## 🚀 WHAT YOU'LL RECEIVE BACK:

1. **Complete React Project** - Ready to run with `npm start`
2. **Custom UI Component Library** - Buttons, forms, cards, etc.
3. **All Requested Pages** - Built exactly to your specs
4. **API Integration Layer** - Connected to your backend
5. **Responsive Design** - Mobile-first, works on all devices
6. **Documentation** - Setup guides, component docs, deployment
7. **Animation & Interactions** - Smooth, professional feel

**SEND THIS COMPLETED FORM BACK TO GET YOUR FRONTEND BUILT!**