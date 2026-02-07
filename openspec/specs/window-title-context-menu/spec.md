# Window Title Context Menu

## Purpose

TBD.

## Requirements

### Requirement: Win98/WinXP title bar shows system menu on right-click
The system SHALL show a context menu when the user right-clicks within the window title bar for Win98 and WinXP themes.

#### Scenario: Right-click title bar opens menu (Win98)
- **WHEN** the active theme is Win98 and the user right-clicks the window title bar
- **THEN** the context menu is displayed at the cursor location

#### Scenario: Right-click title bar opens menu (WinXP)
- **WHEN** the active theme is WinXP and the user right-clicks the window title bar
- **THEN** the context menu is displayed at the cursor location

### Requirement: Menu includes Close action
The context menu SHALL include a Close action.

#### Scenario: Close item is present
- **WHEN** the title-bar context menu is opened
- **THEN** the menu contains a Close item

### Requirement: Close action triggers window close handler
Selecting Close SHALL invoke the window's onClose handler if provided.

#### Scenario: Close invokes handler
- **WHEN** the user selects Close from the title-bar context menu
- **THEN** the window onClose handler is called once

### Requirement: Non Win98/WinXP themes do not show the menu
The system SHALL NOT show the title-bar context menu for themes other than Win98 or WinXP.

#### Scenario: Right-click title bar on other themes
- **WHEN** the active theme is not Win98 or WinXP and the user right-clicks the window title bar
- **THEN** no title-bar context menu is shown
