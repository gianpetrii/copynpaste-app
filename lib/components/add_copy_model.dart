import '/flutter_flow/flutter_flow_util.dart';
import 'add_copy_widget.dart' show AddCopyWidget;
import 'package:flutter/material.dart';

class AddCopyModel extends FlutterFlowModel<AddCopyWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for addCopyInputText widget.
  FocusNode? addCopyInputTextFocusNode;
  TextEditingController? addCopyInputTextTextController;
  String? Function(BuildContext, String?)?
      addCopyInputTextTextControllerValidator;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    addCopyInputTextFocusNode?.dispose();
    addCopyInputTextTextController?.dispose();
  }
}
