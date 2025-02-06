import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

type PrivateRouteProps = {
  children: ReactNode;
  allowedRoles: Array<string>;
};

const PrivateRoute = (props: PrivateRouteProps) => {
  const user = useSelector((state: RootState) => state.user);

  for (let i = 0; i < props.allowedRoles.length; i++) {
    if (user.role == props.allowedRoles[i]) {
      return props.children;
    }
  }

  return null;
};

export default PrivateRoute;
