import '/flutter_flow/flutter_flow_util.dart';
import 'login_widget.dart' show LoginWidget;
import 'package:flutter/material.dart';

class LoginModel extends FlutterFlowModel<LoginWidget> {
  ///  State fields for stateful widgets in this page.

  final unfocusNode = FocusNode();
  final formKey2 = GlobalKey<FormState>();
  final formKey1 = GlobalKey<FormState>();
  // State field(s) for TabBar widget.
  TabController? tabBarController;
  int get tabBarCurrentIndex =>
      tabBarController != null ? tabBarController!.index : 0;

  // State field(s) for userSignup widget.
  FocusNode? userSignupFocusNode;
  TextEditingController? userSignupTextController;
  String? Function(BuildContext, String?)? userSignupTextControllerValidator;
  String? _userSignupTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return 'Field is required';
    }

    if (!RegExp(kTextValidatorEmailRegex).hasMatch(val)) {
      return 'Has to be a valid email address.';
    }
    return null;
  }

  // State field(s) for passSignup widget.
  FocusNode? passSignupFocusNode;
  TextEditingController? passSignupTextController;
  late bool passSignupVisibility;
  String? Function(BuildContext, String?)? passSignupTextControllerValidator;
  String? _passSignupTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return 'Field is required';
    }

    if (val.length < 7) {
      return 'Requires at least 7 characters.';
    }

    return null;
  }

  // State field(s) for confPassLogin widget.
  FocusNode? confPassLoginFocusNode;
  TextEditingController? confPassLoginTextController;
  late bool confPassLoginVisibility;
  String? Function(BuildContext, String?)? confPassLoginTextControllerValidator;
  String? _confPassLoginTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return 'Field is required';
    }

    if (val.length < 7) {
      return 'Requires at least 7 characters.';
    }

    return null;
  }

  // State field(s) for userLogin widget.
  FocusNode? userLoginFocusNode;
  TextEditingController? userLoginTextController;
  String? Function(BuildContext, String?)? userLoginTextControllerValidator;
  // State field(s) for passLogin widget.
  FocusNode? passLoginFocusNode;
  TextEditingController? passLoginTextController;
  late bool passLoginVisibility;
  String? Function(BuildContext, String?)? passLoginTextControllerValidator;

  @override
  void initState(BuildContext context) {
    userSignupTextControllerValidator = _userSignupTextControllerValidator;
    passSignupVisibility = false;
    passSignupTextControllerValidator = _passSignupTextControllerValidator;
    confPassLoginVisibility = false;
    confPassLoginTextControllerValidator =
        _confPassLoginTextControllerValidator;
    passLoginVisibility = false;
  }

  @override
  void dispose() {
    unfocusNode.dispose();
    tabBarController?.dispose();
    userSignupFocusNode?.dispose();
    userSignupTextController?.dispose();

    passSignupFocusNode?.dispose();
    passSignupTextController?.dispose();

    confPassLoginFocusNode?.dispose();
    confPassLoginTextController?.dispose();

    userLoginFocusNode?.dispose();
    userLoginTextController?.dispose();

    passLoginFocusNode?.dispose();
    passLoginTextController?.dispose();
  }
}
