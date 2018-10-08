import * as styles from "./WidgetToolbar.scss";

import * as React from "react";
import { observer } from "mobx-react";

import { Button, Collapse, InputGroup } from "@blueprintjs/core";

import { MainStore } from "../MainStore";
import { classNames, handleStringChange } from "../util";


export type WidgetToolbarProps = {
    store: MainStore;
    className?: string;
}

@observer
export class WidgetToolbar extends React.Component<WidgetToolbarProps> {

    public render() {
        const { className, store } = this.props;

        return (
            <Collapse isOpen={store.isWidgetToolbarOpen}>
                <div className={classNames(styles.widgetToolbar, className)}>
                    <div className={styles.widgetToolbarMenu}>
                        <InputGroup
                            placeholder="Search..."
                            leftIcon="search"
                            round={true}
                            onChange={handleStringChange(store.setWidgetFilter)}/>
                        <Button minimal icon="pin"/>
                        <Button minimal icon="cross"
                                onClick={store.closeWidgetToolbar}/>
                    </div>
                </div>
            </Collapse>
        )
    }

}