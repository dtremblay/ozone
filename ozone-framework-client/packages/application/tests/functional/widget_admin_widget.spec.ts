import { NightwatchAPI } from "nightwatch";

import { GlobalElements, WidgetAdminWidget } from "./selectors";

import { loggedInAs } from "./helpers";
import { MainPage } from "./pages";

const LOGIN_USERNAME: string = "testAdmin1";
const LOGIN_PASSWORD: string = "password";

const NEW_WIDGET_NAME: string = "Example Functional Test Widget";
const NEW_WIDGET_DESCRIPTION: string = "An Example Functional Testing Ozone Widget";
const NEW_WIDGET_VERSION: string = "3.14";
const NEW_WIDGET_UNIVERSAL_NAME: string = "mil.navy.spawar.geocent.widgets.example";
const NEW_WIDGET_URL: string = "http://example.mil/index.html";
const NEW_WIDGET_SMALL_ICON_URL: string = "http://example.mil/images/icon-small.png";
const NEW_WIDGET_MEDIUM_ICON_URL: string = "http://example.mil/images/icon-medium.png";
const NEW_WIDGET_WIDTH: string = "250";
const NEW_WIDGET_HEIGHT: string = "300";

const NEW_WIDGET_MODIFIED_NAME: string = "Example Modified Functional Test Widget";

module.exports = {
    "As an Administrator, I can view all Widgets in the Widget Admin Widget": (browser: NightwatchAPI) => {
        loggedInAs(browser, LOGIN_USERNAME, LOGIN_PASSWORD, "Test Administrator 1");

        const widgetAdmin = new MainPage(browser)
            .openUserMenu()
            .openAdminDialog()
            .openWidgetAdminWidget();

        widgetAdmin.assertContainsWidget("Widget Administration");

        browser.closeWindow().end();
    },

    "As an Administrator, I can create a new widget": (browser: NightwatchAPI) => {
        loggedInAs(browser, LOGIN_USERNAME, LOGIN_PASSWORD, "Test Administrator 1");

        const widgetAdmin = new MainPage(browser)
            .openUserMenu()
            .openAdminDialog()
            .openWidgetAdminWidget();

        const propertiesPanel = widgetAdmin
            .clickCreateButton()
            .clickCreateWithoutDescriptor()
            .assertContainsSubmitButton()
            .assertSubmitButtonIsDisabled();

        browser
            .setValue(WidgetAdminWidget.CreateWidget.NAME_INPUT, NEW_WIDGET_NAME)
            .setValue(WidgetAdminWidget.CreateWidget.DESCRIPTION_INPUT, NEW_WIDGET_DESCRIPTION)
            .setValue(WidgetAdminWidget.CreateWidget.VERSION_INPUT, NEW_WIDGET_VERSION)
            .setValue(WidgetAdminWidget.CreateWidget.UNIVERSAL_NAME_INPUT, NEW_WIDGET_UNIVERSAL_NAME)
            .setValue(WidgetAdminWidget.CreateWidget.URL_INPUT, NEW_WIDGET_URL)
            .setValue(WidgetAdminWidget.CreateWidget.SMALL_ICON_INPUT, NEW_WIDGET_SMALL_ICON_URL)
            .setValue(WidgetAdminWidget.CreateWidget.MEDIUM_ICON_INPUT, NEW_WIDGET_MEDIUM_ICON_URL)
            .clearValue(WidgetAdminWidget.CreateWidget.WIDTH_INPUT)
            .setValue(WidgetAdminWidget.CreateWidget.WIDTH_INPUT, NEW_WIDGET_WIDTH)
            .clearValue(WidgetAdminWidget.CreateWidget.HEIGHT_INPUT)
            .setValue(WidgetAdminWidget.CreateWidget.HEIGHT_INPUT, NEW_WIDGET_HEIGHT)
            .pause(1000);

        browser
            .click(WidgetAdminWidget.CreateWidget.WIDGET_TYPE_BUTTON)
            .click("a.bp3-menu-item:first-child")
            .pause(1000);

        propertiesPanel
            .assertSubmitButtonIsEnabled()
            .clickSubmitButton()
            .assertSubmitButtonIsDisabled()
            .clickBackButton();

        browser.setValue(WidgetAdminWidget.Main.SEARCH_FIELD, NEW_WIDGET_NAME);

        browser.expect.element(WidgetAdminWidget.Main.DIALOG).text.to.contain(NEW_WIDGET_NAME);

        browser.closeWindow().end();
    },

    "As an Administrator, I can edit a widget": (browser: NightwatchAPI) => {
        loggedInAs(browser, LOGIN_USERNAME, LOGIN_PASSWORD, "Test Administrator 1");

        const widgetAdmin = new MainPage(browser)
            .openUserMenu()
            .openAdminDialog()
            .openWidgetAdminWidget();

        const propertiesPanel = widgetAdmin
            .setSearchValue(NEW_WIDGET_NAME)
            .assertCanEditWidget(NEW_WIDGET_NAME)
            .editWidget(NEW_WIDGET_NAME);

        browser
            .clearValue(WidgetAdminWidget.PropertiesGroup.NAME_INPUT)
            .setValue(WidgetAdminWidget.PropertiesGroup.NAME_INPUT, NEW_WIDGET_MODIFIED_NAME)
            .pause(500);

        propertiesPanel
            .assertSubmitButtonIsEnabled()
            .clickSubmitButton()
            .assertSubmitButtonIsDisabled()
            .clickBackButton();

        browser
            .clearValue(WidgetAdminWidget.Main.SEARCH_FIELD)
            .setValue(WidgetAdminWidget.Main.SEARCH_FIELD, NEW_WIDGET_MODIFIED_NAME);

        browser.expect.element(WidgetAdminWidget.Main.DIALOG).text.to.contain(NEW_WIDGET_MODIFIED_NAME);
        browser.expect.element(WidgetAdminWidget.Main.DIALOG).text.to.not.contain(NEW_WIDGET_NAME);

        browser.closeWindow().end();
    },

    "As an Administrator, I can delete a widget": (browser: NightwatchAPI) => {
        loggedInAs(browser, LOGIN_USERNAME, LOGIN_PASSWORD, "Test Administrator 1");

        const mainPage = new MainPage(browser)
            .openUserMenu()
            .openAdminDialog()
            .openWidgetAdminWidget()
            .setSearchValue(NEW_WIDGET_MODIFIED_NAME);

        mainPage
            .assertContainsWidget(NEW_WIDGET_MODIFIED_NAME)
            .assertCanDeleteWidget(NEW_WIDGET_MODIFIED_NAME)
            .deleteWidget(NEW_WIDGET_MODIFIED_NAME);

        browser
            .pause(500)
            .waitForElementPresent(
                GlobalElements.CONFIRMATION_DIALOG_CONFIRM_BUTTON,
                1000,
                "[Confirmation Dialog] is present"
            )
            .click(GlobalElements.CONFIRMATION_DIALOG_CONFIRM_BUTTON)
            .pause(500)
            .waitForElementNotPresent(
                GlobalElements.CONFIRMATION_DIALOG_CONFIRM_BUTTON,
                1000,
                "[Confirmation Dialog] is not present"
            );

        mainPage.assertNotContainsWidget(NEW_WIDGET_MODIFIED_NAME);

        browser.closeWindow().end();
    }
};
