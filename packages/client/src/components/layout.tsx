import { useContext, useEffect, useState } from "react";

import { authRefresh } from "../api/api";
import { AuthContext } from "../context";
import { Loader } from "./loader";

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout = (props: LayoutProps) => {
    const { setContext } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        authRefresh()
            .then(async (response) => {
                if (response.ok) {
                    const data = await response.json();

                    setContext({ token: data.token, user: data.user });
                    setLoading(false);
                } else {
                    setLoading(false);
                }
            })
            .catch((error) => {
                setLoading(false);
            });
    }, []);

    return (
        <div>
            {/* <NavigationBar loading={loading} /> */}
            {/* <div className="dummy"></div> */}
            {loading ? (
                <Loader />
            ) : (
                <div className="h-screen">{props.children}</div>
            )}
        </div>
    );
};
