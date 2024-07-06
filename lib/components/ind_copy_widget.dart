import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'ind_copy_model.dart';
export 'ind_copy_model.dart';

class IndCopyWidget extends StatefulWidget {
  const IndCopyWidget({
    super.key,
    String? copyText,
    required this.eraseReference,
  }) : copyText = copyText ?? 'nothing to copy';

  final String copyText;
  final DocumentReference? eraseReference;

  @override
  State<IndCopyWidget> createState() => _IndCopyWidgetState();
}

class _IndCopyWidgetState extends State<IndCopyWidget> {
  late IndCopyModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => IndCopyModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).info,
        boxShadow: const [
          BoxShadow(
            blurRadius: 4.0,
            color: Color(0x33000000),
            offset: Offset(
              0.0,
              2.0,
            ),
          )
        ],
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(8.0),
          bottomRight: Radius.circular(8.0),
          topLeft: Radius.circular(8.0),
          topRight: Radius.circular(8.0),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Align(
            alignment: const AlignmentDirectional(0.0, 0.0),
            child: FlutterFlowIconButton(
              borderRadius: 8.0,
              buttonSize: 40.0,
              icon: Icon(
                Icons.delete_outline,
                color: FlutterFlowTheme.of(context).primary,
                size: 30.0,
              ),
              onPressed: () async {
                await widget.eraseReference!.delete();
              },
            ),
          ),
          Flexible(
            child: Align(
              alignment: const AlignmentDirectional(-1.0, 0.0),
              child: Padding(
                padding: const EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 0.0, 0.0),
                child: SelectionArea(
                    child: Text(
                  valueOrDefault<String>(
                    widget.copyText,
                    'none',
                  ).maybeHandleOverflow(
                    maxChars: 250,
                    replacement: '…',
                  ),
                  textAlign: TextAlign.start,
                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                        fontFamily: 'Readex Pro',
                        color: Colors.black,
                        letterSpacing: 0.0,
                      ),
                )),
              ),
            ),
          ),
          FlutterFlowIconButton(
            borderRadius: 8.0,
            buttonSize: 40.0,
            icon: const Icon(
              Icons.content_copy,
              color: Colors.black,
              size: 24.0,
            ),
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: widget.copyText));
            },
          ),
        ],
      ),
    );
  }
}
