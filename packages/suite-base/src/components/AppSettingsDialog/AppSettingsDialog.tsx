// SPDX-FileCopyrightText: Copyright (C) 2023-2024 Bayerische Motoren Werke Aktiengesellschaft (BMW AG)<lichtblick@bmwgroup.com>
// SPDX-License-Identifier: MPL-2.0

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogProps,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  IconButton,
  Link,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { MouseEvent, SyntheticEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { AppSetting } from "@lichtblick/suite-base/AppSetting";
import CopyButton from "@lichtblick/suite-base/components/CopyButton";
import { ExperimentalFeatureSettings } from "@lichtblick/suite-base/components/ExperimentalFeatureSettings";
import ExtensionsSettings from "@lichtblick/suite-base/components/ExtensionsSettings";
import LichtblickLogoText from "@lichtblick/suite-base/components/LichtblickLogoText";
import Stack from "@lichtblick/suite-base/components/Stack";
import { useAppContext } from "@lichtblick/suite-base/context/AppContext";
import {
  useWorkspaceStore,
  WorkspaceContextStore,
} from "@lichtblick/suite-base/context/Workspace/WorkspaceContext";
import { useAppConfigurationValue } from "@lichtblick/suite-base/hooks/useAppConfigurationValue";
import isDesktopApp from "@lichtblick/suite-base/util/isDesktopApp";

import {
  AutoUpdate,
  ColorSchemeSettings,
  LanguageSettings,
  LaunchDefault,
  MessageFramerate,
  RosPackagePath,
  TimeFormat,
  TimezoneSettings,
} from "./settings";

const useStyles = makeStyles()((theme) => ({
  layoutGrid: {
    display: "grid",
    gap: theme.spacing(2),
    height: "70vh",
    paddingLeft: theme.spacing(1),
    overflowY: "hidden",
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "auto minmax(0, 1fr)",
    },
  },
  logo: {
    width: 212,
    height: "auto",
    marginLeft: theme.spacing(-1),
  },
  tabPanel: {
    display: "none",
    marginRight: "-100%",
    width: "100%",
    padding: theme.spacing(0, 4, 4),
  },
  tabPanelActive: {
    display: "block",
  },
  checkbox: {
    "&.MuiCheckbox-root": {
      paddingTop: 0,
    },
  },
  dialogActions: {
    position: "sticky",
    backgroundColor: theme.palette.background.paper,
    borderTop: `${theme.palette.divider} 1px solid`,
    padding: theme.spacing(1),
    bottom: 0,
  },
  formControlLabel: {
    "&.MuiFormControlLabel-root": {
      alignItems: "start",
    },
  },
  tab: {
    svg: {
      fontSize: "inherit",
    },
    "> span, > .MuiSvgIcon-root": {
      display: "flex",
      color: theme.palette.primary.main,
      marginRight: theme.spacing(1.5),
      height: theme.typography.pxToRem(21),
      width: theme.typography.pxToRem(21),
    },
    [theme.breakpoints.up("sm")]: {
      textAlign: "right",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      minHeight: "auto",
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
    },
  },
  indicator: {
    [theme.breakpoints.up("sm")]: {
      right: 0,
      width: "100%",
      backgroundColor: theme.palette.action.hover,
      borderRadius: theme.shape.borderRadius,
    },
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: theme.typography.h3.fontSize,
  },
}));

type SectionKey = "resources" | "products" | "contact" | "legal";

const aboutItems = new Map<
  SectionKey,
  {
    subheader: string;
    links: { title: string; url?: string }[];
  }
>([
  [
    "legal",
    {
      subheader: "Legal",
      links: [
        {
          title: "License terms",
          url: "https://github.com/lichtblick-suite/lichtblick/blob/main/LICENSE",
        },
      ],
    },
  ],
]);

export type AppSettingsTab =
  | "general"
  | "privacy"
  | "extensions"
  | "experimental-features"
  | "about";

const selectWorkspaceInitialActiveTab = (store: WorkspaceContextStore) =>
  store.dialogs.preferences.initialTab;

export function AppSettingsDialog(
  props: DialogProps & { activeTab?: AppSettingsTab },
): React.JSX.Element {
  const { t } = useTranslation("appSettings");
  const { activeTab: _activeTab } = props;
  const initialActiveTab = useWorkspaceStore(selectWorkspaceInitialActiveTab);
  const [activeTab, setActiveTab] = useState<AppSettingsTab>(
    _activeTab ?? initialActiveTab ?? "general",
  );
  const [debugModeEnabled = false, setDebugModeEnabled] = useAppConfigurationValue<boolean>(
    AppSetting.SHOW_DEBUG_PANELS,
  );
  const { classes, cx, theme } = useStyles();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"));

  const { extensionSettings } = useAppContext();

  // automatic updates are a desktop-only setting
  const supportsAppUpdates = isDesktopApp();

  const handleTabChange = (_event: SyntheticEvent, newValue: AppSettingsTab) => {
    setActiveTab(newValue);
  };

  const handleClose = (event: MouseEvent<HTMLElement>) => {
    if (props.onClose != undefined) {
      props.onClose(event, "backdropClick");
    }
  };

  const extensionSettingsComponent = extensionSettings ?? <ExtensionsSettings />;

  return (
    <Dialog {...props} fullWidth maxWidth="md" data-testid={`AppSettingsDialog--${activeTab}`}>
      <DialogTitle className={classes.dialogTitle}>
        {t("settings")}
        <IconButton edge="end" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <div className={classes.layoutGrid}>
        <Tabs
          classes={{ indicator: classes.indicator }}
          value={activeTab}
          orientation={smUp ? "vertical" : "horizontal"}
          onChange={handleTabChange}
        >
          <Tab className={classes.tab} label={t("general")} value="general" />
          <Tab className={classes.tab} label={t("extensions")} value="extensions" />
          <Tab
            className={classes.tab}
            label={t("experimentalFeatures")}
            value="experimental-features"
          />
          <Tab className={classes.tab} label={t("about")} value="about" />
        </Tabs>
        <Stack direction="row" fullHeight overflowY="auto">
          <section
            className={cx(classes.tabPanel, {
              [classes.tabPanelActive]: activeTab === "general",
            })}
          >
            <Stack gap={2}>
              <ColorSchemeSettings />
              <TimezoneSettings />
              <TimeFormat orientation={smUp ? "horizontal" : "vertical"} />
              <MessageFramerate />
              <LanguageSettings />
              {supportsAppUpdates && <AutoUpdate />}
              {!isDesktopApp() && <LaunchDefault />}
              {isDesktopApp() && <RosPackagePath />}
              <Stack>
                <FormLabel>{t("advanced")}:</FormLabel>
                <FormControlLabel
                  className={classes.formControlLabel}
                  control={
                    <Checkbox
                      className={classes.checkbox}
                      checked={debugModeEnabled}
                      onChange={(_, checked) => {
                        void setDebugModeEnabled(checked);
                      }}
                    />
                  }
                  label={t("debugModeDescription")}
                />
              </Stack>
            </Stack>
          </section>

          <section
            className={cx(classes.tabPanel, {
              [classes.tabPanelActive]: activeTab === "extensions",
            })}
          >
            <Stack gap={2}>{extensionSettingsComponent}</Stack>
          </section>

          <section
            className={cx(classes.tabPanel, {
              [classes.tabPanelActive]: activeTab === "experimental-features",
            })}
          >
            <Stack gap={2}>
              <Alert color="warning" icon={<WarningAmberIcon />}>
                {t("experimentalFeaturesDescription")}
              </Alert>
              <Stack paddingLeft={2}>
                <ExperimentalFeatureSettings />
              </Stack>
            </Stack>
          </section>

          <section
            className={cx(classes.tabPanel, { [classes.tabPanelActive]: activeTab === "about" })}
          >
            <Stack gap={2} alignItems="flex-start">
              <header>
                <LichtblickLogoText color="primary" className={classes.logo} />
              </header>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="body2">
                  Lichtblick version {LICHTBLICK_SUITE_VERSION}
                </Typography>
                <CopyButton
                  size="small"
                  getText={() => LICHTBLICK_SUITE_VERSION?.toString() ?? ""}
                />
              </Stack>
              {[
                aboutItems.get("resources"),
                aboutItems.get("products"),
                aboutItems.get("contact"),
                aboutItems.get("legal"),
              ].map((item) => {
                return (
                  <Stack key={item?.subheader} gap={1}>
                    {item?.subheader && <Typography>{item.subheader}</Typography>}
                    {item?.links.map((link) => (
                      <Link
                        variant="body2"
                        underline="hover"
                        key={link.title}
                        data-testid={link.title}
                        href={link.url}
                        target="_blank"
                      >
                        {link.title}
                      </Link>
                    ))}
                  </Stack>
                );
              })}
            </Stack>
          </section>
        </Stack>
      </div>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}
