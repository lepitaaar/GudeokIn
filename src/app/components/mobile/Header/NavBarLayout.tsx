import MobileMainNavBar from "./MainNavBar";

const NavBarLayout = ({
    children,
    show = true,
    menu = true,
    account = true,
    loginModal = false,
}: {
    children?: React.ReactNode;
    show?: boolean | undefined;
    menu?: boolean | undefined;
    account?: boolean | undefined;
    loginModal?: boolean | undefined;
}) => {
    return (
        <>
            {show && (
                <MobileMainNavBar
                    menu={menu}
                    account={account}
                    loginModal={loginModal}
                />
            )}
            {children}
        </>
    );
};

export default NavBarLayout;
